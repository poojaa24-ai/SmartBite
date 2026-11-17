const express = require('express');
const router = express.Router();
const {
  validateCoupon,
  getActiveCoupons,
  createCoupon,
  deleteCoupon,
} = require('../controllers/couponController');
const { protect, authorize } = require('../middleware/auth');

router.get('/active', getActiveCoupons);
router.post('/validate', validateCoupon);

router.post('/', protect, authorize('admin'), createCoupon);
router.delete('/:id', protect, authorize('admin'), deleteCoupon);

module.exports = router;
