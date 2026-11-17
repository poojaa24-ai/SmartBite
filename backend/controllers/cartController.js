const Cart = require('../models/Cart');
const Food = require('../models/Food');

// @desc    Get user's current cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.food',
        select: 'name price image isVeg freshBatch rescueDeal isAvailable seller preparationTime',
        populate: { path: 'seller', select: 'kitchenName rating isKitchenOpen' },
      })
      .populate('seller', 'kitchenName rating isKitchenOpen address');

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
        totalPrice: 0,
      });
    }

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
exports.addToCart = async (req, res, next) => {
  try {
    const { foodId, quantity = 1, isRescueItem = false, specialInstructions = '', resetCartIfDifferentSeller = false } = req.body;

    const food = await Food.findById(foodId).populate('seller');
    if (!food) {
      return res.status(404).json({ success: false, message: 'Dish not found' });
    }

    if (!food.isAvailable) {
      return res.status(400).json({ success: false, message: 'This food item is currently unavailable.' });
    }

    // FEATURE 1: FRESHBATCH Validation
    const availableStock = isRescueItem
      ? (food.rescueDeal && food.rescueDeal.active ? food.rescueDeal.remainingPortions : 0)
      : food.freshBatch.availablePortions;

    if (availableStock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${availableStock} portion(s) available for "${food.name}". You cannot order ${quantity}.`,
        availablePortions: availableStock,
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: [],
        totalPrice: 0,
      });
    }

    // Check seller conflict (Only 1 home kitchen per order)
    if (cart.seller && cart.items.length > 0 && cart.seller.toString() !== food.seller._id.toString()) {
      if (!resetCartIfDifferentSeller) {
        return res.status(409).json({
          success: false,
          conflict: true,
          message: 'Your cart contains homemade food from another kitchen. Would you like to clear your cart and start a new order?',
        });
      } else {
        cart.items = [];
      }
    }

    cart.seller = food.seller._id;

    // Price check (normal vs rescue deal)
    const effectivePrice = isRescueItem && food.rescueDeal.active ? food.rescueDeal.discountedPrice : food.price;

    // Check if item already exists in cart
    const existingIndex = cart.items.findIndex((item) => item.food.toString() === foodId && item.isRescueItem === !!isRescueItem);

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + Number(quantity);
      if (newQty > availableStock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Maximum available FreshBatch portions is ${availableStock}.`,
          availablePortions: availableStock,
        });
      }
      cart.items[existingIndex].quantity = newQty;
      cart.items[existingIndex].price = effectivePrice;
    } else {
      cart.items.push({
        food: foodId,
        quantity: Number(quantity),
        price: effectivePrice,
        isRescueItem: !!isRescueItem,
        specialInstructions,
      });
    }

    cart.calculateTotal();
    await cart.save();

    await cart.populate({
      path: 'items.food',
      select: 'name price image isVeg freshBatch rescueDeal isAvailable seller preparationTime',
      populate: { path: 'seller', select: 'kitchenName rating isKitchenOpen' },
    });
    await cart.populate('seller', 'kitchenName rating isKitchenOpen address');

    res.status(200).json({
      success: true,
      cart,
      message: `Added ${food.name} to your cart!`,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update item quantity in cart
// @route   PUT /api/cart/items/:itemId
// @access  Private
exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    if (Number(quantity) <= 0) {
      cart.items.pull(req.params.itemId);
      if (cart.items.length === 0) {
        cart.seller = null;
      }
    } else {
      const food = await Food.findById(item.food);
      if (!food) {
        cart.items.pull(req.params.itemId);
      } else {
        const availableStock = item.isRescueItem
          ? (food.rescueDeal && food.rescueDeal.active ? food.rescueDeal.remainingPortions : 0)
          : food.freshBatch.availablePortions;

        if (Number(quantity) > availableStock) {
          return res.status(400).json({
            success: false,
            message: `Only ${availableStock} portion(s) available for "${food.name}".`,
            availablePortions: availableStock,
          });
        }
        item.quantity = Number(quantity);
      }
    }

    cart.calculateTotal();
    await cart.save();

    await cart.populate({
      path: 'items.food',
      select: 'name price image isVeg freshBatch rescueDeal isAvailable seller preparationTime',
      populate: { path: 'seller', select: 'kitchenName rating isKitchenOpen' },
    });
    await cart.populate('seller', 'kitchenName rating isKitchenOpen address');

    res.status(200).json({
      success: true,
      cart,
      message: 'Cart updated',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:itemId
// @access  Private
exports.removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items.pull(req.params.itemId);
    if (cart.items.length === 0) {
      cart.seller = null;
    }

    cart.calculateTotal();
    await cart.save();

    res.status(200).json({
      success: true,
      cart,
      message: 'Item removed from cart',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      cart.seller = null;
      cart.totalPrice = 0;
      await cart.save();
    }

    res.status(200).json({
      success: true,
      cart,
      message: 'Cart cleared',
    });
  } catch (err) {
    next(err);
  }
};
