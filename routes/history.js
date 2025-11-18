const express = require('express');
const router = express.Router();
const History = require('../models/History');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Get all history (Admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const history = await History.find()
      .populate('createdBy', 'username fullName')
      .populate('updatedBy', 'username fullName')
      .populate('deletedBy', 'username fullName')
      .sort({ deletedAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;