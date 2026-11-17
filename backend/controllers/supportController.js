const SupportTicket = require('../models/SupportTicket');

// @desc    Create support ticket
// @route   POST /api/support
// @access  Private
exports.createTicket = async (req, res, next) => {
  try {
    const { subject, category, priority, message, orderId } = req.body;

    const ticketCount = await SupportTicket.countDocuments();
    const ticketId = `TKT-${1000 + ticketCount + 1}`;

    const ticket = await SupportTicket.create({
      ticketId,
      user: req.user._id,
      subject,
      category: category || 'order_issue',
      priority: priority || 'medium',
      status: 'open',
      order: orderId || undefined,
      messages: [
        {
          sender: req.user._id,
          senderRole: req.user.role,
          message,
          timestamp: new Date(),
        },
      ],
    });

    res.status(201).json({
      success: true,
      ticket,
      message: `Support ticket #${ticket.ticketId} created. Our support team will assist you shortly.`,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's tickets
// @route   GET /api/support/my
// @access  Private
exports.getMyTickets = async (req, res, next) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      tickets,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all tickets (Admin)
// @route   GET /api/support/all
// @access  Private (Admin)
exports.getAllTickets = async (req, res, next) => {
  try {
    const { status, category } = req.query;
    let query = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const tickets = await SupportTicket.find(query).populate('user', 'name email phone avatar role').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add message to ticket thread
// @route   POST /api/support/:id/messages
// @access  Private
exports.addTicketMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found' });
    }

    const isOwner = ticket.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    ticket.messages.push({
      sender: req.user._id,
      senderRole: req.user.role,
      message,
      timestamp: new Date(),
    });

    if (isAdmin && ticket.status === 'open') {
      ticket.status = 'in_progress';
    }

    await ticket.save();

    res.status(200).json({
      success: true,
      ticket,
      message: 'Message sent successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update ticket status
// @route   PUT /api/support/:id/status
// @access  Private (Admin)
exports.updateTicketStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found' });
    }

    ticket.status = status;
    await ticket.save();

    res.status(200).json({
      success: true,
      ticket,
      message: `Ticket status updated to ${status}.`,
    });
  } catch (err) {
    next(err);
  }
};
