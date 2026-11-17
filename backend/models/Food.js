const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SellerProfile',
      required: true,
    },
    kitchenName: {
      type: String,
      default: '',
    },
    name: {
      type: String,
      required: [true, 'Dish name is required'],
      trim: true,
      maxlength: [100, 'Dish name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [1, 'Price must be greater than 0'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    categoryName: {
      type: String,
      default: 'Homestyle Meals',
    },
    image: {
      type: String,
      required: [true, 'Dish image is required'],
      default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    },
    isVeg: {
      type: Boolean,
      default: true,
    },
    ingredients: [
      {
        type: String,
        trim: true,
      },
    ],
    allergens: [
      {
        type: String,
        trim: true,
      },
    ],
    preparationTime: {
      type: Number,
      default: 30, // in minutes
      min: 5,
    },
    calories: {
      type: Number,
      default: 350,
    },
    servingSize: {
      type: String,
      default: '1 Plate / 1 Person',
    },
    // FEATURE 1: FRESHBATCH
    freshBatch: {
      totalPortions: { type: Number, default: 20 },
      availablePortions: { type: Number, default: 20 },
      soldPortions: { type: Number, default: 0 },
      batchDate: { type: Date, default: Date.now },
      isActive: { type: Boolean, default: true },
    },
    // FEATURE 3: FOOD RESCUE DEALS
    rescueDeal: {
      isRescueDeal: { type: Boolean, default: false },
      originalPrice: { type: Number, default: 0 },
      discountedPrice: { type: Number, default: 0 },
      remainingPortions: { type: Number, default: 0 },
      pickupDeadline: { type: String, default: '09:00 PM' },
      active: { type: Boolean, default: false },
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    tags: [{ type: String }],
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

foodSchema.index({ name: 'text', description: 'text', tags: 'text' });
foodSchema.index({ category: 1, isVeg: 1, price: 1, rating: -1 });

module.exports = mongoose.model('Food', foodSchema);
