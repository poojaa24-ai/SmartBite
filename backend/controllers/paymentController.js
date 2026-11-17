const crypto = require('crypto');
const razorpayInstance = require('../config/razorpay');
const Payment = require('../models/Payment');
const Order = require('../models/Order');

// @desc    Create Razorpay Order
// @route   POST /api/payments/razorpay/create-order
// @access  Private
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (!razorpayInstance) {
      // If Razorpay instance is not initialized (e.g. placeholder keys), notify client to use simulated payment
      return res.status(200).json({
        success: true,
        useSimulated: true,
        message: 'Razorpay keys not configured. Please use Simulated Payment option for local demonstration.',
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: order.totalAmount * 100,
        currency: 'INR',
        orderId: order._id,
      });
    }

    const options = {
      amount: Math.round(order.totalAmount * 100), // in paise
      currency: 'INR',
      receipt: `rcpt_${order.orderNumber}`,
      payment_capture: 1,
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    res.status(200).json({
      success: true,
      useSimulated: false,
      razorpayOrder,
      keyId: process.env.RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      orderId: order._id,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/payments/razorpay/verify
// @access  Private
exports.verifyRazorpayPayment = async (req, res, next) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature verification failed.' });
    }

    order.paymentStatus = 'paid';
    order.paymentMethod = 'razorpay';
    order.paymentId = razorpayPaymentId;
    await order.save();

    await Payment.create({
      order: order._id,
      user: req.user._id,
      amount: order.totalAmount,
      currency: 'INR',
      method: 'razorpay',
      status: 'captured',
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      transactionRef: razorpayPaymentId,
    });

    res.status(200).json({
      success: true,
      order,
      message: 'Payment verified and captured successfully!',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Process Simulated Payment (For local demonstration & testing)
// @route   POST /api/payments/simulated
// @access  Private
exports.processSimulatedPayment = async (req, res, next) => {
  try {
    const { orderId, method = 'simulated_upi', simulatedUpiId, cardNumber } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const transactionRef = `SIM-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    order.paymentStatus = 'paid';
    order.paymentMethod = method;
    order.paymentId = transactionRef;
    await order.save();

    const payment = await Payment.create({
      order: order._id,
      user: req.user._id,
      amount: order.totalAmount,
      currency: 'INR',
      method: method,
      status: 'captured',
      transactionRef,
    });

    res.status(200).json({
      success: true,
      order,
      payment,
      message: 'Simulated payment completed successfully! Your order is confirmed.',
    });
  } catch (err) {
    next(err);
  }
};
