const Subscription = require('../models/Subscription');
const SellerProfile = require('../models/SellerProfile');
const Notification = require('../models/Notification');

// @desc    Create new daily meal subscription (FEATURE 2)
// @route   POST /api/subscriptions
// @access  Private
exports.createSubscription = async (req, res, next) => {
  try {
    const {
      sellerId,
      planTitle,
      mealType,
      planDuration,
      startDate,
      deliveryTimeSlot,
      deliveryAddress,
      dietaryNotes,
    } = req.body;

    const seller = await SellerProfile.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Home chef kitchen not found' });
    }

    const start = new Date(startDate || Date.now());
    const durationDays = planDuration === 'weekly' ? 7 : 30;
    const end = new Date(start.getTime() + durationDays * 24 * 60 * 60 * 1000);

    // Pricing benchmark
    let pricePerMeal = 110;
    if (mealType === 'breakfast') pricePerMeal = 70;
    if (mealType === 'lunch') pricePerMeal = 120;
    if (mealType === 'dinner') pricePerMeal = 110;
    if (mealType === 'all_day') pricePerMeal = 260; // 3 meals combo

    const totalMeals = mealType === 'all_day' ? durationDays * 3 : durationDays;
    const totalAmount = (mealType === 'all_day' ? 260 : pricePerMeal) * durationDays;

    const subscription = await Subscription.create({
      customer: req.user._id,
      seller: seller._id,
      planTitle: planTitle || `${seller.kitchenName} Daily Meal Plan`,
      mealType,
      planDuration,
      startDate: start,
      endDate: end,
      deliveryTimeSlot: deliveryTimeSlot || '12:30 PM - 01:30 PM',
      deliveryAddress,
      pricePerMeal,
      totalMeals,
      totalAmount,
      status: 'active',
      dietaryNotes: dietaryNotes || '',
    });

    // Notify seller
    await Notification.create({
      recipient: seller.user,
      sender: req.user._id,
      title: 'New Meal Plan Subscriber!',
      message: `${req.user.name} subscribed to your ${planDuration} ${mealType} meal plan!`,
      type: 'subscription',
      link: '/seller/subscriptions',
    });

    res.status(201).json({
      success: true,
      subscription,
      message: `Successfully subscribed to ${planDuration} meal plan! Fresh homemade meals will start arriving on ${start.toDateString()}.`,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user's subscriptions
// @route   GET /api/subscriptions/my
// @access  Private
exports.getMySubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find({ customer: req.user._id })
      .populate('seller', 'kitchenName logo phone address rating')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: subscriptions.length,
      subscriptions,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get seller's meal subscribers
// @route   GET /api/subscriptions/seller
// @access  Private (Seller)
exports.getSellerSubscriptions = async (req, res, next) => {
  try {
    const seller = await SellerProfile.findOne({ user: req.user._id });
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller profile not found' });
    }

    const subscriptions = await Subscription.find({ seller: seller._id })
      .populate('customer', 'name phone email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: subscriptions.length,
      subscriptions,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update subscription status (pause, resume, cancel)
// @route   PUT /api/subscriptions/:id/status
// @access  Private
exports.updateSubscriptionStatus = async (req, res, next) => {
  try {
    const { status, pauseDate } = req.body;
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    const isCustomer = subscription.customer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const seller = await SellerProfile.findOne({ user: req.user._id });
    const isSeller = seller && subscription.seller.toString() === seller._id.toString();

    if (!isCustomer && !isAdmin && !isSeller) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    if (status) {
      subscription.status = status;
    }

    if (pauseDate) {
      subscription.pauseDates.push(new Date(pauseDate));
    }

    await subscription.save();

    res.status(200).json({
      success: true,
      subscription,
      message: `Subscription has been updated to ${subscription.status}.`,
    });
  } catch (err) {
    next(err);
  }
};
