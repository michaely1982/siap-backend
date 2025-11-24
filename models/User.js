const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  nip: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  fullName: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false  // New users are not verified by default
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  verifiedAt: {
    type: Date
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Export with check to prevent overwrite error
module.exports = mongoose.models.User || mongoose.model('User', UserSchema);