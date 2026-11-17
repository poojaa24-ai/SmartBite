const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
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
    planTitle: {
      type: String,
      required: true,
      default: 'Daily Homestyle Tiffin Box',
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'all_day'],
      required: true,
    },
    planDuration: {
      type: String,
      enum: ['weekly', 'monthly'],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    deliveryTimeSlot: {
      type: String,
      default: '12:30 PM - 01:30 PM',
    },
    deliveryAddress: {
      street: { type: String, required: true },
      locality: { type: String, required: true },
      city: { type: String, default: 'Bangalore' },
      pincode: { type: String, required: true },
      phone: { type: String, required: true },
    },
    pricePerMeal: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    totalMeals: {
      type: Number,
      required: true,
    },
    deliveredMeals: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'cancelled', 'completed'],
      default: 'active',
      index: true,
    },
    dietaryNotes: {
      type: String,
      default: '',
    },
    pauseDates: [
      {
        type: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
