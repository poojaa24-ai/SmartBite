const express = require('express');
const router = express.Router();
const {
  createReview,
  getFoodReviews,
  getSellerReviews,
  replyToReview,
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router.get('/food/:foodId', getFoodReviews);
router.get('/seller/:sellerId', getSellerReviews);

router.post('/', protect, createReview);
router.post('/:id/reply', protect, authorize('seller', 'admin'), replyToReview);

module.exports = router;
