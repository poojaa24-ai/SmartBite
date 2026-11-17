const express = require('express');
const router = express.Router();
const {
  getFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
  updateFreshBatch,
  getRescueDeals,
  createRescueDeal,
} = require('../controllers/foodController');
const { protect, authorize, verifySellerApproved } = require('../middleware/auth');

// Public
router.get('/', getFoods);
router.get('/rescue-deals', getRescueDeals);
router.get('/:id', getFoodById);

// Seller/Admin
router.post('/', protect, authorize('seller', 'admin'), verifySellerApproved, createFood);
router.put('/:id', protect, authorize('seller', 'admin'), updateFood);
router.delete('/:id', protect, authorize('seller', 'admin'), deleteFood);
router.put('/:id/freshbatch', protect, authorize('seller', 'admin'), updateFreshBatch);
router.post('/:id/rescue-deal', protect, authorize('seller', 'admin'), createRescueDeal);

module.exports = router;
