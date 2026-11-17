const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/recommendationController');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Optional auth middleware
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'smartbite_super_secure_jwt_token_secret_key_2026');
      req.user = await User.findById(decoded.id).select('-password');
    } catch (e) {
      // ignore invalid token in optional auth
    }
  }
  next();
};

router.get('/', optionalAuth, getRecommendations);

module.exports = router;
