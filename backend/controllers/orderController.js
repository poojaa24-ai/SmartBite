const Order = require('../models/Order');
const Food = require('../models/Food');
const Cart = require('../models/Cart');
const SellerProfile = require('../models/SellerProfile');
const Coupon = require('../models/Coupon');
const Notification = require('../models/Notification');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const {
      orderType = 'delivery',
      deliveryAddress,
      paymentMethod = 'simulated_upi',
      couponCode,
    } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.food');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty.' });
    }

    const seller = await SellerProfile.findById(cart.seller);
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Kitchen profile not found.' });
    }

    if (!seller.isKitchenOpen) {
      return res.status(400).json({ success: false, message: 'This home kitchen is currently closed for orders.' });
    }

    // Server-side price calculation & FreshBatch portion verification
    let itemsTotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const food = await Food.findById(item.food._id);
      if (!food || !food.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `Dish "${item.food.name}" is no longer available.`,
        });
      }

      // FreshBatch / Rescue Deal portions check
      const isRescue = item.isRescueItem;
      const availableStock = isRescue
        ? (food.rescueDeal && food.rescueDeal.active ? food.rescueDeal.remainingPortions : 0)
        : food.freshBatch.availablePortions;

      if (availableStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient FreshBatch portions for "${food.name}". Available: ${availableStock}, Requested: ${item.quantity}.`,
        });
      }

      const itemPrice = isRescue && food.rescueDeal.active ? food.rescueDeal.discountedPrice : food.price;
      itemsTotal += itemPrice * item.quantity;

      orderItems.push({
        food: food._id,
        name: food.name,
        price: itemPrice,
        quantity: item.quantity,
        image: food.image,
        isVeg: food.isVeg,
        isRescueItem: isRescue,
      });

      // FEATURE 1: FRESHBATCH Automatic Decrement
      if (isRescue) {
        food.rescueDeal.remainingPortions -= item.quantity;
        if (food.rescueDeal.remainingPortions <= 0) {
          food.rescueDeal.active = false;
        }
      } else {
        food.freshBatch.availablePortions = Math.max(0, food.freshBatch.availablePortions - item.quantity);
        food.freshBatch.soldPortions += item.quantity;
      }
      await food.save();
    }

    // Coupon calculation
    let discountAmount = 0;
    let appliedCoupon = '';
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (coupon) {
        const validation = coupon.isValid(itemsTotal);
        if (validation.valid) {
          discountAmount = coupon.calculateDiscount(itemsTotal);
          appliedCoupon = coupon.code;
          coupon.usedCount += 1;
          await coupon.save();
        }
      }
    }

    const deliveryFee = orderType === 'delivery' ? 35 : 0;
    const platformFee = 5;
    const taxAmount = Math.round((itemsTotal - discountAmount) * 0.05); // 5% GST
    const totalAmount = Math.max(0, itemsTotal - discountAmount + deliveryFee + platformFee + taxAmount);

    const orderNumber = `SB-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const order = await Order.create({
      orderNumber,
      customer: req.user._id,
      seller: seller._id,
      items: orderItems,
      orderType,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : { street: 'Pickup from Kitchen', city: seller.address.city },
      itemsTotal,
      discountAmount,
      couponCode: appliedCoupon,
      deliveryFee,
      platformFee,
      taxAmount,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      orderStatus: 'placed',
      timeline: [
        {
          status: 'placed',
          note: 'Order successfully placed with the home kitchen.',
          timestamp: new Date(),
        },
      ],
      estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000), // 45 mins
    });

    // Clear cart
    cart.items = [];
    cart.seller = null;
    cart.totalPrice = 0;
    await cart.save();

    // Increment seller completed/placed orders
    seller.totalOrdersCompleted += 1;
    await seller.save();

    // Create notifications for seller
    await Notification.create({
      recipient: seller.user,
      sender: req.user._id,
      title: 'New Order Received!',
      message: `Order #${order.orderNumber} for ₹${order.totalAmount} was placed by ${req.user.name}.`,
      type: 'order',
      link: `/seller/orders`,
    });

    // Emit Socket.IO event if available
    const io = req.app.get('socketio');
    if (io) {
      io.to(`seller_${seller._id}`).emit('order:new', { order });
    }

    res.status(201).json({
      success: true,
      order,
      message: 'Order placed successfully! The home chef has been notified.',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('seller', 'kitchenName logo phone address rating')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single order details
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone avatar')
      .populate('seller', 'kitchenName logo phone address rating operatingHours');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Access check: customer, seller of this order, or admin
    const isCustomer = order.customer._id.toString() === req.user._id.toString();
    const isSeller = order.seller.user && order.seller.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    // Allow seller profile check as well
    const sellerProf = await SellerProfile.findOne({ user: req.user._id });
    const isMatchingSeller = sellerProf && order.seller._id.toString() === sellerProf._id.toString();

    if (!isCustomer && !isSeller && !isMatchingSeller && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this order.' });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Seller/Admin)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id).populate('customer');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Role check
    if (req.user.role !== 'admin') {
      const seller = await SellerProfile.findOne({ user: req.user._id });
      if (!seller || order.seller.toString() !== seller._id.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized to update this order.' });
      }
    }

    const validStatuses = ['placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status' });
    }

    order.orderStatus = status;
    order.timeline.push({
      status,
      note: note || `Order status updated to ${status.replace(/_/g, ' ')}.`,
      timestamp: new Date(),
    });

    if (status === 'delivered') {
      order.paymentStatus = 'paid';
    }

    await order.save();

    // Create notification for customer
    await Notification.create({
      recipient: order.customer._id,
      title: `Order #${order.orderNumber} Update`,
      message: `Your homemade order is now ${status.replace(/_/g, ' ')}!`,
      type: 'order',
      link: `/order-tracking/${order._id}`,
    });

    // Real-time Socket.IO emission
    const io = req.app.get('socketio');
    if (io) {
      io.to(`order_${order._id}`).emit('order:status_update', {
        orderId: order._id,
        orderStatus: status,
        timeline: order.timeline,
      });
    }

    res.status(200).json({
      success: true,
      order,
      message: `Order marked as ${status.replace(/_/g, ' ')}.`,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel order (Customer can cancel if placed, or Seller/Admin)
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const isCustomer = order.customer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const seller = await SellerProfile.findOne({ user: req.user._id });
    const isSeller = seller && order.seller.toString() === seller._id.toString();

    if (!isCustomer && !isAdmin && !isSeller) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    if (isCustomer && order.orderStatus !== 'placed') {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled as preparation has already commenced.',
      });
    }

    order.orderStatus = 'cancelled';
    order.cancellationReason = reason || 'Cancelled by user';
    order.cancelledBy = isCustomer ? 'customer' : isSeller ? 'seller' : 'admin';
    order.timeline.push({
      status: 'cancelled',
      note: `Cancelled (${order.cancellationReason})`,
      timestamp: new Date(),
    });

    // Restore FreshBatch portions!
    for (const item of order.items) {
      const food = await Food.findById(item.food);
      if (food) {
        food.freshBatch.availablePortions += item.quantity;
        food.freshBatch.soldPortions = Math.max(0, food.freshBatch.soldPortions - item.quantity);
        await food.save();
      }
    }

    await order.save();

    // Socket update
    const io = req.app.get('socketio');
    if (io) {
      io.to(`order_${order._id}`).emit('order:status_update', {
        orderId: order._id,
        orderStatus: 'cancelled',
        timeline: order.timeline,
      });
    }

    res.status(200).json({
      success: true,
      order,
      message: 'Order cancelled successfully and FreshBatch portions have been restored.',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get seller's orders
// @route   GET /api/orders/seller-orders
// @access  Private (Seller)
exports.getSellerOrders = async (req, res, next) => {
  try {
    const seller = await SellerProfile.findOne({ user: req.user._id });
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller profile not found' });
    }

    const orders = await Order.find({ seller: seller._id })
      .populate('customer', 'name phone email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (err) {
    next(err);
  }
};
