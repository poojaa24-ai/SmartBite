const SellerProfile = require('../models/SellerProfile');
const User = require('../models/User');
const Food = require('../models/Food');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Notification = require('../models/Notification');

// @desc    Get all verified home chefs (Public)
// @route   GET /api/sellers
// @access  Public
exports.getSellers = async (req, res, next) => {
  try {
    const { city, cuisine, search, sort } = req.query;
    let query = { verificationStatus: 'approved' };

    if (city) {
      query['address.city'] = new RegExp(city, 'i');
    }

    if (cuisine) {
      query.cuisines = { $in: [new RegExp(cuisine, 'i')] };
    }

    if (search) {
      query.$or = [
        { kitchenName: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { cuisines: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = { rating: -1 };
    if (sort === 'orders') sortOption = { totalOrdersCompleted: -1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };

    const sellers = await SellerProfile.find(query).populate('user', 'name avatar email phone').sort(sortOption);

    res.status(200).json({
      success: true,
      count: sellers.length,
      sellers,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single home chef by ID (Public)
// @route   GET /api/sellers/:id
// @access  Public
exports.getSellerById = async (req, res, next) => {
  try {
    const seller = await SellerProfile.findById(req.params.id).populate('user', 'name avatar email phone');
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Home kitchen not found' });
    }

    const foods = await Food.find({ seller: seller._id, isAvailable: true }).populate('category', 'name slug');
    const reviews = await Review.find({ seller: seller._id }).populate('customer', 'name avatar').sort({ createdAt: -1 }).limit(10);

    res.status(200).json({
      success: true,
      seller,
      foods,
      reviews,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current seller profile
// @route   GET /api/sellers/me/profile
// @access  Private (Seller)
exports.getMySellerProfile = async (req, res, next) => {
  try {
    const seller = await SellerProfile.findOne({ user: req.user._id }).populate('user', 'name avatar email phone');
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller profile not found' });
    }

    res.status(200).json({
      success: true,
      seller,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update current seller kitchen profile
// @route   PUT /api/sellers/me/profile
// @access  Private (Seller)
exports.updateMySellerProfile = async (req, res, next) => {
  try {
    let seller = await SellerProfile.findOne({ user: req.user._id });
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller profile not found' });
    }

    const {
      kitchenName,
      tagline,
      bio,
      phone,
      address,
      logo,
      banner,
      operatingHours,
      cuisines,
      bankDetails,
    } = req.body;

    if (kitchenName) seller.kitchenName = kitchenName;
    if (tagline) seller.tagline = tagline;
    if (bio) seller.bio = bio;
    if (phone) seller.phone = phone;
    if (address) seller.address = { ...seller.address, ...address };
    if (logo) seller.logo = logo;
    if (banner) seller.banner = banner;
    if (operatingHours) seller.operatingHours = { ...seller.operatingHours, ...operatingHours };
    if (cuisines) seller.cuisines = cuisines;
    if (bankDetails) seller.bankDetails = { ...seller.bankDetails, ...bankDetails };

    await seller.save();

    res.status(200).json({
      success: true,
      seller,
      message: 'Kitchen profile updated successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit verification details (FSSAI, ID)
// @route   POST /api/sellers/me/verification
// @access  Private (Seller)
exports.submitVerification = async (req, res, next) => {
  try {
    const { fssaiNumber, fssaiDocument, governmentId } = req.body;
    const seller = await SellerProfile.findOne({ user: req.user._id });

    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller profile not found' });
    }

    seller.fssaiNumber = fssaiNumber || seller.fssaiNumber;
    seller.fssaiDocument = fssaiDocument || seller.fssaiDocument;
    seller.governmentId = governmentId || seller.governmentId;
    seller.verificationStatus = 'pending';
    seller.verificationNotes = 'Application submitted and awaiting admin verification.';

    await seller.save();

    // Create system notification for admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        recipient: admin._id,
        sender: req.user._id,
        title: 'New Seller Verification Submitted',
        message: `${seller.kitchenName} submitted verification documents for approval.`,
        type: 'verification',
        link: '/admin/verification',
      });
    }

    res.status(200).json({
      success: true,
      seller,
      message: 'Verification documents submitted successfully for administrative review.',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle kitchen open/close status
// @route   PUT /api/sellers/me/toggle-status
// @access  Private (Seller)
exports.toggleKitchenStatus = async (req, res, next) => {
  try {
    const seller = await SellerProfile.findOne({ user: req.user._id });
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller profile not found' });
    }

    seller.isKitchenOpen = !seller.isKitchenOpen;
    await seller.save();

    res.status(200).json({
      success: true,
      isKitchenOpen: seller.isKitchenOpen,
      message: `Kitchen is now ${seller.isKitchenOpen ? 'Open for orders' : 'Closed'}`,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get seller dashboard statistics
// @route   GET /api/sellers/me/stats
// @access  Private (Seller)
exports.getSellerStats = async (req, res, next) => {
  try {
    const seller = await SellerProfile.findOne({ user: req.user._id });
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller profile not found' });
    }

    const totalOrders = await Order.countDocuments({ seller: seller._id });
    const pendingOrders = await Order.countDocuments({ seller: seller._id, orderStatus: { $in: ['placed', 'confirmed', 'preparing'] } });
    const completedOrders = await Order.countDocuments({ seller: seller._id, orderStatus: 'delivered' });

    // Calculate revenue
    const revenueAgg = await Order.aggregate([
      { $match: { seller: seller._id, paymentStatus: 'paid' } },
      { $group: { _id: null, totalSales: { $sum: '$totalAmount' } } },
    ]);
    const totalSales = revenueAgg.length > 0 ? revenueAgg[0].totalSales : 0;
    const netEarnings = Math.round(totalSales * 0.9); // 10% SmartBite platform fee

    const activeFoodsCount = await Food.countDocuments({ seller: seller._id, isAvailable: true });
    const totalReviews = await Review.countDocuments({ seller: seller._id });

    // Recent orders
    const recentOrders = await Order.find({ seller: seller._id })
      .populate('customer', 'name phone avatar')
      .sort({ createdAt: -1 })
      .limit(5);

    // FreshBatch summary
    const freshBatchDishes = await Food.find({
      seller: seller._id,
      'freshBatch.isActive': true,
    }).select('name freshBatch price image');

    res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        completedOrders,
        totalSales,
        netEarnings,
        platformFee: Math.round(totalSales * 0.1),
        activeFoodsCount,
        rating: seller.rating,
        totalReviews,
        isKitchenOpen: seller.isKitchenOpen,
        verificationStatus: seller.verificationStatus,
      },
      recentOrders,
      freshBatchDishes,
    });
  } catch (err) {
    next(err);
  }
};
