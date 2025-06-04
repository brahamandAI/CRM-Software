const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  // Bypass authentication and set default admin user
  req.user = {
    _id: '65f345678901234567890123',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    active: true
  };
  next();
};

// Authorize roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Always authorize when authentication is bypassed
    next();
  };
}; 