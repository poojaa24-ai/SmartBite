const Review = require('../models/Review');
const Food = require('../models/Food');
const SellerProfile = require('../models/SellerProfile');
const Order = require('../models/Order');

// @desc    Submit review for food & kitchen
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res, next) => {
  try {
    const { foodId, rating, comment, photos, orderId } = req.body;

    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ success: false, message: 'Dish not found' });
    }

    const review = await Review.create({
      customer: req.user._id,
      food: food._id,
      seller: food.seller,
      order: orderId || undefined,
      rating: Number(rating),
      comment,
      photos: photos || [],
    });

    if (orderId) {
      await Order.findByIdAndUpdate(orderId, { reviewSubmitted: true });
    }

    // Recalculate Food average rating
    const foodReviews = await Review.find({ food: food._id });
    const avgFoodRating = foodReviews.reduce((sum, r) => sum + r.rating, 0) / foodReviews.length;
    food.rating = Number(avgFoodRating.toFixed(1));
    food.numReviews = foodReviews.length;
    await food.save();

    // Recalculate SellerProfile overall rating
    const sellerReviews = await Review.find({ seller: food.seller });
    const avgSellerRating = sellerReviews.reduce((sum, r) => sum + r.rating, 0) / sellerReviews.length;
    await SellerProfile.findByIdAndUpdate(food.seller, {
      rating: Number(avgSellerRating.toFixed(1)),
      numReviews: sellerReviews.length,
    });

    res.status(201).json({
      success: true,
      review,
      message: 'Thank you for your feedback! Your review helps home chefs grow.',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get reviews for a food item
// @route   GET /api/reviews/food/:foodId
// @access  Public
exports.getFoodReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ food: req.params.foodId })
      .populate('customer', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get reviews for a seller's kitchen
// @route   GET /api/reviews/seller/:sellerId
// @access  Public
exports.getSellerReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ seller: req.params.sellerId })
      .populate('customer', 'name avatar')
      .populate('food', 'name image')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Chef reply to a review
// @route   POST /api/reviews/:id/reply
// @access  Private (Seller)
exports.replyToReview = async (req, res, next) => {
  try {
    const { reply } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const seller = await SellerProfile.findOne({ user: req.user._id });
    if (!seller || review.seller.toString() !== seller._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    review.chefReply = {
      reply,
      repliedAt: new Date(),
    };
    await review.save();

    res.status(200).json({
      success: true,
      review,
      message: 'Response posted to customer review.',
    });
  } catch (err) {
    next(err);
  }
};
