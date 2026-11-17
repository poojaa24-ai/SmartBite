const Coupon = require('../models/Coupon');

// @desc    Validate coupon code
// @route   POST /api/coupons/validate
// @access  Private / Public
exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Please provide a coupon code.' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code.' });
    }

    const validation = coupon.isValid(Number(orderAmount) || 0);
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.reason });
    }

    const discount = coupon.calculateDiscount(Number(orderAmount) || 0);

    res.status(200).json({
      success: true,
      valid: true,
      code: coupon.code,
      discount,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      message: `Coupon applied! You saved ₹${discount}`,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get active coupons
// @route   GET /api/coupons/active
// @access  Public
exports.getActiveCoupons = async (req, res, next) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      validUntil: { $gte: now },
    }).select('-usedCount');

    res.status(200).json({
      success: true,
      coupons,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create coupon (Admin)
// @route   POST /api/coupons
// @access  Private (Admin)
exports.createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({
      success: true,
      coupon,
      message: 'Coupon created successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete coupon (Admin)
// @route   DELETE /api/coupons/:id
// @access  Private (Admin)
exports.deleteCoupon = async (req, res, next) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};
