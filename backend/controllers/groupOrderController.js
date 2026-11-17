const GroupOrder = require('../models/GroupOrder');
const Food = require('../models/Food');
const SellerProfile = require('../models/SellerProfile');
const Order = require('../models/Order');

// Helper to generate unique group code
const generateGroupCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'SB-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// @desc    Create new community group order (FEATURE 4)
// @route   POST /api/group-orders
// @access  Private
exports.createGroupOrder = async (req, res, next) => {
  try {
    const { sellerId, name, deliveryAddress } = req.body;

    const seller = await SellerProfile.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Home chef kitchen not found' });
    }

    let code = generateGroupCode();
    let existing = await GroupOrder.findOne({ code });
    while (existing) {
      code = generateGroupCode();
      existing = await GroupOrder.findOne({ code });
    }

    const groupOrder = await GroupOrder.create({
      code,
      hostUser: req.user._id,
      seller: seller._id,
      name: name || `${req.user.name}'s Group Order`,
      status: 'open',
      participants: [
        {
          user: req.user._id,
          name: `${req.user.name} (Host)`,
          phone: req.user.phone || '',
          items: [],
          subtotal: 0,
          paid: false,
        },
      ],
      totalAmount: 0,
      deliveryAddress: deliveryAddress || { city: seller.address.city },
    });

    res.status(201).json({
      success: true,
      groupOrder,
      shareLink: `/group-orders/${groupOrder.code}`,
      message: `Group order created! Share code: ${groupOrder.code}`,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get group order details by code
// @route   GET /api/group-orders/:code
// @access  Public (or authenticated)
exports.getGroupOrderByCode = async (req, res, next) => {
  try {
    const groupOrder = await GroupOrder.findOne({ code: req.params.code.toUpperCase() })
      .populate('hostUser', 'name email avatar')
      .populate('seller', 'kitchenName logo phone address rating isKitchenOpen')
      .populate('participants.items.food', 'name price image isVeg freshBatch');

    if (!groupOrder) {
      return res.status(404).json({ success: false, message: 'Group order not found with this code' });
    }

    res.status(200).json({
      success: true,
      groupOrder,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Join a group order as a participant
// @route   POST /api/group-orders/:code/join
// @access  Public / Private
exports.joinGroupOrder = async (req, res, next) => {
  try {
    const { participantName, phone } = req.body;
    const groupOrder = await GroupOrder.findOne({ code: req.params.code.toUpperCase() });

    if (!groupOrder) {
      return res.status(404).json({ success: false, message: 'Group order not found' });
    }

    if (groupOrder.status !== 'open') {
      return res.status(400).json({ success: false, message: 'This group order is closed or already locked for checkout.' });
    }

    const name = participantName || (req.user ? req.user.name : 'Guest Member');
    const existingIndex = groupOrder.participants.findIndex(
      (p) => (req.user && p.user && p.user.toString() === req.user._id.toString()) || p.name.toLowerCase() === name.toLowerCase()
    );

    if (existingIndex === -1) {
      groupOrder.participants.push({
        user: req.user ? req.user._id : undefined,
        name,
        phone: phone || (req.user ? req.user.phone : ''),
        items: [],
        subtotal: 0,
      });
      await groupOrder.save();
    }

    res.status(200).json({
      success: true,
      groupOrder,
      message: `Joined group order "${groupOrder.name}" successfully!`,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add or update food items for a participant in the group order
// @route   POST /api/group-orders/:code/items
// @access  Public / Private
exports.updateParticipantItems = async (req, res, next) => {
  try {
    const { participantName, foodId, quantity } = req.body;
    const groupOrder = await GroupOrder.findOne({ code: req.params.code.toUpperCase() });

    if (!groupOrder) {
      return res.status(404).json({ success: false, message: 'Group order not found' });
    }

    if (groupOrder.status !== 'open') {
      return res.status(400).json({ success: false, message: 'Group order is locked.' });
    }

    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    // Find participant
    let participant = groupOrder.participants.find(
      (p) => (req.user && p.user && p.user.toString() === req.user._id.toString()) || (participantName && p.name.toLowerCase() === participantName.toLowerCase())
    );

    if (!participant) {
      participant = {
        user: req.user ? req.user._id : undefined,
        name: participantName || (req.user ? req.user.name : 'Team Member'),
        phone: req.user ? req.user.phone : '',
        items: [],
        subtotal: 0,
      };
      groupOrder.participants.push(participant);
      participant = groupOrder.participants[groupOrder.participants.length - 1];
    }

    // Update items inside participant
    const itemIndex = participant.items.findIndex((item) => item.food.toString() === foodId);
    const qty = Number(quantity);

    if (qty <= 0) {
      if (itemIndex > -1) {
        participant.items.splice(itemIndex, 1);
      }
    } else {
      if (itemIndex > -1) {
        participant.items[itemIndex].quantity = qty;
      } else {
        participant.items.push({
          food: food._id,
          name: food.name,
          price: food.price,
          quantity: qty,
        });
      }
    }

    groupOrder.recalculateTotal();
    await groupOrder.save();

    // Broadcast update via Socket.IO
    const io = req.app.get('socketio');
    if (io) {
      io.to(`group_${groupOrder.code}`).emit('group:updated', { groupOrder });
    }

    res.status(200).json({
      success: true,
      groupOrder,
      message: 'Items updated in group order.',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Host locks and checks out the group order
// @route   POST /api/group-orders/:code/checkout
// @access  Private
exports.lockAndCheckoutGroupOrder = async (req, res, next) => {
  try {
    const { deliveryAddress, paymentMethod = 'simulated_upi' } = req.body;
    const groupOrder = await GroupOrder.findOne({ code: req.params.code.toUpperCase() }).populate('seller');

    if (!groupOrder) {
      return res.status(404).json({ success: false, message: 'Group order not found' });
    }

    if (groupOrder.hostUser.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the host can check out this group order.' });
    }

    // Consolidate all participant items into a single master Order
    const aggregatedItems = [];
    let itemsTotal = 0;

    for (const p of groupOrder.participants) {
      for (const item of p.items) {
        const food = await Food.findById(item.food);
        if (food) {
          // Decrement FreshBatch portion
          food.freshBatch.availablePortions = Math.max(0, food.freshBatch.availablePortions - item.quantity);
          food.freshBatch.soldPortions += item.quantity;
          await food.save();

          itemsTotal += item.price * item.quantity;
          aggregatedItems.push({
            food: food._id,
            name: `${item.name} (${p.name})`,
            price: item.price,
            quantity: item.quantity,
            image: food.image,
            isVeg: food.isVeg,
          });
        }
      }
    }

    if (aggregatedItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Cannot place order with no items.' });
    }

    const orderNumber = `GRP-${groupOrder.code}-${Math.floor(100 + Math.random() * 900)}`;
    const deliveryFee = 35;
    const platformFee = 5;
    const taxAmount = Math.round(itemsTotal * 0.05);
    const totalAmount = itemsTotal + deliveryFee + platformFee + taxAmount;

    const order = await Order.create({
      orderNumber,
      customer: req.user._id,
      seller: groupOrder.seller._id,
      items: aggregatedItems,
      orderType: 'delivery',
      deliveryAddress: deliveryAddress || groupOrder.deliveryAddress,
      itemsTotal,
      deliveryFee,
      platformFee,
      taxAmount,
      totalAmount,
      paymentMethod,
      paymentStatus: 'paid',
      orderStatus: 'placed',
      groupOrderId: groupOrder._id,
      timeline: [
        {
          status: 'placed',
          note: `Community Group Order placed with ${groupOrder.participants.length} participants.`,
          timestamp: new Date(),
        },
      ],
    });

    groupOrder.status = 'placed';
    groupOrder.finalOrder = order._id;
    await groupOrder.save();

    // Broadcast to group members
    const io = req.app.get('socketio');
    if (io) {
      io.to(`group_${groupOrder.code}`).emit('group:checkout_complete', { orderId: order._id });
    }

    res.status(200).json({
      success: true,
      order,
      groupOrder,
      message: 'Group order successfully placed!',
    });
  } catch (err) {
    next(err);
  }
};
