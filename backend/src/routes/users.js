const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/users
// @desc    Get all users
// @access  Private (Admin and Manager only)
router.get('/', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({
      success: true, 
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (Admin and Manager only)
router.get('/:id', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Admin only for role updates, user can update own account)
router.put('/:id', [
  protect,
  body('name').optional().trim().notEmpty().withMessage('Name is required'),
  body('email').optional().isEmail().withMessage('Please include a valid email').normalizeEmail(),
  body('role').optional().isIn(['admin', 'manager', 'agent']).withMessage('Invalid role')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  try {
    // Check if user exists
    let user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check authorization
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this user' 
      });
    }

    // Restrict role changes to admin only
    if (req.body.role && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to change user roles' 
      });
    }

    // Build update object
    const updateFields = {};
    if (req.body.name) updateFields.name = req.body.name;
    if (req.body.email) updateFields.email = req.body.email;
    if (req.body.role && req.user.role === 'admin') updateFields.role = req.body.role;
    if (req.body.active !== undefined && req.user.role === 'admin') updateFields.active = req.body.active;
    
    // Update user
    user = await User.findByIdAndUpdate(
      req.params.id, 
      { $set: updateFields }, 
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    await user.remove();
    
    res.json({
      success: true,
      message: 'User deleted'
    });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   PUT /api/users/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', [
  protect,
  body('currentPassword', 'Current password is required').exists(),
  body('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  const { currentPassword, newPassword } = req.body;

  try {
    // Get user with password
    const user = await User.findById(req.user.id);
    
    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router; 