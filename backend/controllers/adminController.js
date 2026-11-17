const User = require('../models/User');
const SellerProfile = require('../models/SellerProfile');
const Order = require('../models/Order');
const Food = require('../models/Food');
const Subscription = require('../models/Subscription');
const SupportTicket = require('../models/SupportTicket');
const Notification = require('../models/Notification');

// @desc    Get Admin Master Dashboard Statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getAdminStats = async (req, res, next) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalSellers = await SellerProfile.countDocuments();
    const approvedSellers = await SellerProfile.countDocuments({ verificationStatus: 'approved' });
    const pendingVerifications = await SellerProfile.countDocuments({ verificationStatus: 'pending' });

    const totalOrders = await Order.countDocuments();
    const activeOrders = await Order.countDocuments({ orderStatus: { $in: ['placed', 'confirmed', 'preparing', 'out_for_delivery'] } });
    const completedOrders = await Order.countDocuments({ orderStatus: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ orderStatus: 'cancelled' });

    // Total platform revenue
    const revenueAgg = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;
    const platformCommission = Math.round(totalRevenue * 0.1); // 10% platform share

    const totalFoods = await Food.countDocuments();
    const totalSubscriptions = await Subscription.countDocuments({ status: 'active' });
    const openTickets = await SupportTicket.countDocuments({ status: 'open' });

    // Recent orders
    const recentOrders = await Order.find()
      .populate('customer', 'name email phone avatar')
      .populate('seller', 'kitchenName logo')
      .sort({ createdAt: -1 })
      .limit(8);

    // Recent seller applications
    const pendingSellers = await SellerProfile.find({ verificationStatus: 'pending' })
      .populate('user', 'name email phone avatar')
      .sort({ createdAt: -1 })
      .limit(5);

    // Sales by Category aggregation for analytics
    const categoryStats = await Food.aggregate([
      { $group: { _id: '$categoryName', count: { $sum: 1 }, avgPrice: { $avg: '$price' } } },
      { $sort: { count: -1 } },
    ]);

    // Monthly orders & revenue trends
    const monthlyStats = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: { $month: '$createdAt' },
          orders: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { '_id': 1 } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalCustomers,
        totalSellers,
        approvedSellers,
        pendingVerifications,
        totalOrders,
        activeOrders,
        completedOrders,
        cancelledOrders,
        totalRevenue,
        platformCommission,
        totalFoods,
        totalSubscriptions,
        openTickets,
      },
      recentOrders,
      pendingSellers,
      categoryStats,
      monthlyStats,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify or Reject Seller Application (FEATURE 5: VERIFIED HOME KITCHEN)
// @route   PUT /api/admin/sellers/:id/verify
// @access  Private (Admin)
exports.verifySeller = async (req, res, next) => {
  try {
    const { status, notes, foodSafetyCertified } = req.body;
    const seller = await SellerProfile.findById(req.params.id).populate('user');

    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller profile not found' });
    }

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid verification status' });
    }

    seller.verificationStatus = status;
    if (notes) seller.verificationNotes = notes;
    if (foodSafetyCertified !== undefined) seller.foodSafetyCertified = foodSafetyCertified;

    await seller.save();

    // Create notification for seller
    await Notification.create({
      recipient: seller.user._id,
      title: status === 'approved' ? 'Kitchen Verification Approved! 🎉' : 'Kitchen Verification Update',
      message: status === 'approved'
        ? `Congratulations! ${seller.kitchenName} is now verified. You can now publish homemade food listings.`
        : `Your kitchen verification application was ${status}: ${notes || 'Please review requirements.'}`,
      type: 'verification',
      link: '/seller/verification',
    });

    res.status(200).json({
      success: true,
      seller,
      message: `Seller status updated to ${status}.`,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all customers
// @route   GET /api/admin/customers
// @access  Private (Admin)
exports.getCustomers = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = { role: 'customer' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const customers = await User.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle user active/inactive status
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private (Admin)
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      isActive: user.isActive,
      message: `User ${user.name} is now ${user.isActive ? 'Active' : 'Deactivated'}`,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all sellers (Admin)
// @route   GET /api/admin/sellers
// @access  Private (Admin)
exports.getAllSellers = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status) query.verificationStatus = status;
    if (search) {
      query.$or = [
        { kitchenName: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } },
      ];
    }

    const sellers = await SellerProfile.find(query)
      .populate('user', 'name email phone avatar isActive')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sellers.length,
      sellers,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all orders (Admin Master List)
// @route   GET /api/admin/orders
// @access  Private (Admin)
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let query = {};
    if (status) query.orderStatus = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .populate('customer', 'name email phone avatar')
      .populate('seller', 'kitchenName logo phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      orders,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all subscriptions across platform
// @route   GET /api/admin/subscriptions
// @access  Private (Admin)
exports.getAllSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find()
      .populate('customer', 'name email phone')
      .populate('seller', 'kitchenName phone')
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
