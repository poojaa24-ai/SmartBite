const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  isRescueItem: {
    type: Boolean,
    default: false,
  },
  specialInstructions: {
    type: String,
    default: '',
    maxlength: 200,
  },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SellerProfile',
    },
    items: [cartItemSchema],
    totalPrice: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Method to recalculate cart total
cartSchema.methods.calculateTotal = function () {
  this.totalPrice = this.items.reduce((total, item) => total + item.price * item.quantity, 0);
  return this.totalPrice;
};

module.exports = mongoose.model('Cart', cartSchema);
