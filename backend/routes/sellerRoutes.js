const express = require('express');
const router = express.Router();
const {
  getSellers,
  getSellerById,
  getMySellerProfile,
  updateMySellerProfile,
  submitVerification,
  toggleKitchenStatus,
  getSellerStats,
} = require('../controllers/sellerController');
const { protect, authorize } = require('../middleware/auth');

// Public
router.get('/', getSellers);
router.get('/:id', getSellerById);

// Seller Private
router.get('/me/profile', protect, authorize('seller', 'admin'), getMySellerProfile);
router.put('/me/profile', protect, authorize('seller', 'admin'), updateMySellerProfile);
router.post('/me/verification', protect, authorize('seller', 'admin'), submitVerification);
router.put('/me/toggle-status', protect, authorize('seller', 'admin'), toggleKitchenStatus);
router.get('/me/stats', protect, authorize('seller', 'admin'), getSellerStats);

module.exports = router;
