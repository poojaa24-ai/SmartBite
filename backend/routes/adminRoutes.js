const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  verifySeller,
  getCustomers,
  toggleUserStatus,
  getAllSellers,
  getAllOrders,
  getAllSubscriptions,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/customers', getCustomers);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.get('/sellers', getAllSellers);
router.put('/sellers/:id/verify', verifySeller);
router.get('/orders', getAllOrders);
router.get('/subscriptions', getAllSubscriptions);

module.exports = router;
