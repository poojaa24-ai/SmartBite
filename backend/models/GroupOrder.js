const mongoose = require('mongoose');

const participantItemSchema = new mongoose.Schema({
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const participantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    default: '',
  },
  items: [participantItemSchema],
  subtotal: {
    type: Number,
    default: 0,
  },
  paid: {
    type: Boolean,
    default: false,
  },
});

const groupOrderSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    hostUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SellerProfile',
      required: true,
    },
    name: {
      type: String,
      required: true,
      default: 'Community Group Order',
    },
    status: {
      type: String,
      enum: ['open', 'locked', 'placed', 'cancelled'],
      default: 'open',
    },
    participants: [participantSchema],
    totalAmount: {
      type: Number,
      default: 0,
    },
    deliveryAddress: {
      street: { type: String, default: '' },
      locality: { type: String, default: '' },
      city: { type: String, default: 'Bangalore' },
      pincode: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    finalOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
    },
  },
  {
    timestamps: true,
  }
);

groupOrderSchema.methods.recalculateTotal = function () {
  this.totalAmount = this.participants.reduce((acc, p) => {
    p.subtotal = p.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return acc + p.subtotal;
  }, 0);
  return this.totalAmount;
};

module.exports = mongoose.model('GroupOrder', groupOrderSchema);
