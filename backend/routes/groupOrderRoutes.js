const express = require('express');
const router = express.Router();
const {
  createGroupOrder,
  getGroupOrderByCode,
  joinGroupOrder,
  updateParticipantItems,
  lockAndCheckoutGroupOrder,
} = require('../controllers/groupOrderController');
const { protect } = require('../middleware/auth');

// Public lookup by code
router.get('/:code', getGroupOrderByCode);
router.post('/:code/join', joinGroupOrder);
router.post('/:code/items', updateParticipantItems);

// Protected actions
router.post('/', protect, createGroupOrder);
router.post('/:code/checkout', protect, lockAndCheckoutGroupOrder);

module.exports = router;
