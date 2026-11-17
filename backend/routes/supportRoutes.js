const express = require('express');
const router = express.Router();
const {
  createTicket,
  getMyTickets,
  getAllTickets,
  addTicketMessage,
  updateTicketStatus,
} = require('../controllers/supportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', createTicket);
router.get('/my', getMyTickets);
router.post('/:id/messages', addTicketMessage);

// Admin
router.get('/all', authorize('admin'), getAllTickets);
router.put('/:id/status', authorize('admin'), updateTicketStatus);

module.exports = router;
