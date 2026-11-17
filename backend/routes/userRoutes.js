const express = require('express');
const router = express.Router();
const {
  toggleFavorite,
  getFavorites,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/favorites/:foodId', toggleFavorite);
router.get('/favorites', getFavorites);

router.route('/addresses').get(getAddresses).post(addAddress);
router.route('/addresses/:id').put(updateAddress).delete(deleteAddress);

router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.put('/notifications/read-all', markAllNotificationsRead);

module.exports = router;
