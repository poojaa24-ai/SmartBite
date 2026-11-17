const User = require('../models/User');
const Address = require('../models/Address');
const Notification = require('../models/Notification');
const Food = require('../models/Food');

// @desc    Toggle favorite food
// @route   POST /api/users/favorites/:foodId
// @access  Private
exports.toggleFavorite = async (req, res, next) => {
  try {
    const { foodId } = req.params;
    const user = await User.findById(req.user._id);

    const existsIndex = user.favorites.indexOf(foodId);
    let isFavorited = false;

    if (existsIndex > -1) {
      user.favorites.splice(existsIndex, 1);
      isFavorited = false;
    } else {
      user.favorites.push(foodId);
      isFavorited = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      isFavorited,
      favorites: user.favorites,
      message: isFavorited ? 'Added to favorites' : 'Removed from favorites',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user favorite foods
// @route   GET /api/users/favorites
// @access  Private
exports.getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'favorites',
      populate: { path: 'seller', select: 'kitchenName rating verificationStatus' },
    });

    res.status(200).json({
      success: true,
      favorites: user.favorites || [],
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user addresses
// @route   GET /api/users/addresses
// @access  Private
exports.getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    res.status(200).json({
      success: true,
      addresses,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add new address
// @route   POST /api/users/addresses
// @access  Private
exports.addAddress = async (req, res, next) => {
  try {
    const { label, recipientName, phone, street, locality, city, state, pincode, landmark, isDefault } = req.body;

    if (isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    // If first address, make default
    const count = await Address.countDocuments({ user: req.user._id });

    const address = await Address.create({
      user: req.user._id,
      label: label || 'Home',
      recipientName: recipientName || req.user.name,
      phone: phone || req.user.phone,
      street,
      locality,
      city: city || 'Bangalore',
      state: state || 'Karnataka',
      pincode,
      landmark: landmark || '',
      isDefault: isDefault || count === 0,
    });

    res.status(201).json({
      success: true,
      address,
      message: 'Address added successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update address
// @route   PUT /api/users/addresses/:id
// @access  Private
exports.updateAddress = async (req, res, next) => {
  try {
    let address = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    if (req.body.isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    address = await Address.findByIdAndUpdate(req.params.id, req.body, { new: true });

    res.status(200).json({
      success: true,
      address,
      message: 'Address updated successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete address
// @route   DELETE /api/users/addresses/:id
// @access  Private
exports.deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user notifications
// @route   GET /api/users/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).limit(30);
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });

    res.status(200).json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/users/notifications/:id/read
// @access  Private
exports.markNotificationRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, recipient: req.user._id }, { isRead: true });
    res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/users/notifications/read-all
// @access  Private
exports.markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};
