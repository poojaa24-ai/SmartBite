const mongoose = require('mongoose');

const sellerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    kitchenName: {
      type: String,
      required: [true, 'Kitchen name is required'],
      trim: true,
      maxlength: [80, 'Kitchen name cannot exceed 80 characters'],
    },
    tagline: {
      type: String,
      default: 'Authentic Homestyle Cooked with Love',
      maxlength: [140, 'Tagline cannot exceed 140 characters'],
    },
    bio: {
      type: String,
      default: 'Welcome to our home kitchen! We craft hygienic, authentic regional delicacies daily using family heritage recipes.',
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      street: { type: String, default: '' },
      locality: { type: String, default: '' },
      city: { type: String, default: 'Bangalore' },
      state: { type: String, default: 'Karnataka' },
      pincode: { type: String, default: '560001' },
      coordinates: {
        lat: { type: Number, default: 12.9716 },
        lng: { type: Number, default: 77.5946 },
      },
    },
    logo: {
      type: String,
      default: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=300&q=80',
    },
    banner: {
      type: String,
      default: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    },
    fssaiNumber: {
      type: String,
      default: '',
      trim: true,
    },
    fssaiDocument: {
      type: String,
      default: '',
    },
    governmentId: {
      type: String,
      default: '',
    },
    foodSafetyCertified: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    verificationNotes: {
      type: String,
      default: 'Application under administrative review for hygienic and document compliance.',
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    isKitchenOpen: {
      type: Boolean,
      default: true,
    },
    operatingHours: {
      open: { type: String, default: '08:00 AM' },
      close: { type: String, default: '09:30 PM' },
    },
    cuisines: [
      {
        type: String,
      },
    ],
    bankDetails: {
      accountHolder: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      ifscCode: { type: String, default: '' },
      upiId: { type: String, default: '' },
    },
    totalOrdersCompleted: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

sellerProfileSchema.index({ 'address.city': 1, verificationStatus: 1 });

module.exports = mongoose.model('SellerProfile', sellerProfileSchema);
