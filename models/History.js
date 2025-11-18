const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  uptdName: {
    type: String,
    required: true
  },
  inputDate: {
    type: String,
    required: true
  },
  fileAmount: {
    type: String,
    required: true
  },
  boxNumber: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    required: true
  },
  updatedAt: {
    type: Date
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deletedAt: {
    type: Date,
    default: Date.now
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: ['created', 'updated', 'deleted'],
    default: 'deleted'
  }
});

// Export with check to prevent overwrite error
module.exports = mongoose.models.History || mongoose.model('History', HistorySchema);