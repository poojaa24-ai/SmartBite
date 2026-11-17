const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SellerProfile = require('../models/SellerProfile');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this resource. Please log in.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'smartbite_super_secure_jwt_token_secret_key_2026');
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    if (!req.user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token is invalid or has expired. Please log in again.',
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'unauthenticated'}' is not authorized to perform this action.`,
      });
    }
    next();
  };
};

const verifySellerApproved = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') return next();

    const seller = await SellerProfile.findOne({ user: req.user._id });
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller kitchen profile not found.',
      });
    }

    if (seller.verificationStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: `Your kitchen application is currently ${seller.verificationStatus}. You must be approved by an administrator before publishing food listings.`,
        verificationStatus: seller.verificationStatus,
      });
    }

    req.sellerProfile = seller;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  protect,
  authorize,
  verifySellerApproved,
};
