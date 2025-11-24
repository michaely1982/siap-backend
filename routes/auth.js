const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   POST api/auth/register
// @desc    Register user (pending verification)
// @access  Public
router.post(
  '/register',
  [
    body('nip', 'NIP is required').notEmpty(),
    body('nip', 'NIP must be numeric').isNumeric(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    body('fullName', 'Full name is required').notEmpty(),
    body('title', 'Title is required').notEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nip, fullName, title, password, role } = req.body;

    try {
      // Check if user exists
      let user = await User.findOne({ nip });
      if (user) {
        return res.status(400).json({ message: 'User with this NIP already exists' });
      }

      // Create user instance (not verified by default)
      user = new User({
        nip,
        fullName,
        title,
        password,
        role: role || 'user',
        isVerified: false  // User needs admin approval
      });

      // Hash password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      // Return success message (no token until verified)
      res.json({
        success: true,
        message: 'Registration successful! Please wait for admin verification.',
        user: {
          id: user.id,
          nip: user.nip,
          fullName: user.fullName,
          title: user.title,
          role: user.role,
          isVerified: user.isVerified
        }
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   POST api/auth/login
// @desc    Login user (only if verified)
// @access  Public
router.post(
  '/login',
  [
    body('nip', 'NIP is required').notEmpty(),
    body('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nip, password } = req.body;

    try {
      // Check if user exists
      let user = await User.findOne({ nip });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Check if user is verified
      if (!user.isVerified) {
        return res.status(403).json({ 
          message: 'Your account is pending admin verification. Please wait for approval.',
          isVerified: false
        });
      }

      // Create JWT payload
      const payload = {
        user: {
          id: user.id,
          role: user.role
        }
      };

      // Sign token
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '7d' },
        (err, token) => {
          if (err) throw err;
          res.json({
            token,
            user: {
              id: user.id,
              nip: user.nip,
              fullName: user.fullName,
              title: user.title,
              role: user.role,
              isVerified: user.isVerified
            }
          });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/auth/user
// @desc    Get logged in user
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    // Double check verification
    if (!user.isVerified) {
      return res.status(403).json({ message: 'Account not verified' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;