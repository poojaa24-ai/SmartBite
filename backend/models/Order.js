const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String },
  isVeg: { type: Boolean, default: true },
  isRescueItem: { type: Boolean, default: false },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SellerProfile',
      required: true,
    },
    items: [orderItemSchema],
    orderType: {
      type: String,
      enum: ['delivery', 'pickup'],
      default: 'delivery',
    },
    deliveryAddress: {
      street: { type: String },
      locality: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
      phone: { type: String },
      instructions: { type: String, default: '' },
    },
    itemsTotal: {
      type: Number,
      required: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    couponCode: {
      type: String,
      default: '',
    },
    deliveryFee: {
      type: Number,
      default: 30,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    platformFee: {
      type: Number,
      default: 5,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'cod', 'simulated', 'simulated_card', 'simulated_upi'],
      default: 'simulated_upi',
    },
    paymentId: {
      type: String,
      default: '',
    },
    orderStatus: {
      type: String,
      enum: ['placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'placed',
      index: true,
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    cancelledBy: {
      type: String,
      enum: ['customer', 'seller', 'admin', 'none'],
      default: 'none',
    },
    estimatedDeliveryTime: {
      type: Date,
    },
    groupOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GroupOrder',
    },
    timeline: [
      {
        status: { type: String },
        note: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    reviewSubmitted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ seller: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
