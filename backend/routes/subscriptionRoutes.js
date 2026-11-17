const express = require('express');
const router = express.Router();
const {
  createSubscription,
  getMySubscriptions,
  getSellerSubscriptions,
  updateSubscriptionStatus,
} = require('../controllers/subscriptionController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', createSubscription);
router.get('/my', getMySubscriptions);
router.get('/seller', authorize('seller', 'admin'), getSellerSubscriptions);
router.put('/:id/status', updateSubscriptionStatus);

module.exports = router;
