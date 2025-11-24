const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const adminAuth = require('../middleware/adminAuth');

// Get all users (Admin only) - including unverified
router.get('/', adminAuth, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('verifiedBy', 'fullName')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single user (Admin only)
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Verify user (Admin only)
router.put('/:id/verify', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isVerified = true;
    user.verifiedAt = new Date();
    user.verifiedBy = req.user.id;

    await user.save();

    const updatedUser = await User.findById(user.id)
      .select('-password')
      .populate('verifiedBy', 'fullName');

    res.json({ 
      message: 'User verified successfully',
      user: updatedUser 
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Unverify user (Admin only)
router.put('/:id/unverify', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isVerified = false;
    user.verifiedAt = null;
    user.verifiedBy = null;

    await user.save();

    const updatedUser = await User.findById(user.id)
      .select('-password');

    res.json({ 
      message: 'User verification revoked',
      user: updatedUser 
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update user (Admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if NIP is being changed and if it's already taken
    if (req.body.nip && req.body.nip !== user.nip) {
      const existingUser = await User.findOne({ nip: req.body.nip });
      if (existingUser) {
        return res.status(400).json({ message: 'NIP already exists' });
      }
    }

    user.nip = req.body.nip || user.nip;
    user.fullName = req.body.fullName || user.fullName;
    user.title = req.body.title || user.title;
    user.role = req.body.role || user.role;

    // Update password if provided
    if (req.body.password && req.body.password.length >= 6) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete user (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;