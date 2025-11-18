const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
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
    default: Date.now
  },
  updatedAt: {
    type: Date
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Export with check to prevent overwrite error
module.exports = mongoose.models.File || mongoose.model('File', FileSchema);