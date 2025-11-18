const express = require('express');
const router = express.Router();
const File = require('../models/File');
const History = require('../models/History');
const auth = require('../middleware/auth');

// Get all files (Protected - all authenticated users)
router.get('/', auth, async (req, res) => {
  try {
    const files = await File.find()
      .populate('createdBy', 'username fullName')
      .populate('updatedBy', 'username fullName')
      .sort({ createdAt: -1 });
    res.json(files);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single file (Protected)
router.get('/:id', auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id)
      .populate('createdBy', 'username fullName')
      .populate('updatedBy', 'username fullName');
    if (!file) return res.status(404).json({ message: 'File not found' });
    res.json(file);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create file (Protected - all authenticated users)
router.post('/', auth, async (req, res) => {
  const file = new File({
    fileName: req.body.fileName,
    uptdName: req.body.uptdName,
    inputDate: req.body.inputDate,
    fileAmount: req.body.fileAmount,
    boxNumber: req.body.boxNumber,
    description: req.body.description,
    createdBy: req.user.id
  });

  try {
    const newFile = await file.save();
    const populatedFile = await File.findById(newFile._id)
      .populate('createdBy', 'username fullName');
    res.status(201).json(populatedFile);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update file (All authenticated users can edit)
router.put('/:id', auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: 'File not found' });

    file.fileName = req.body.fileName || file.fileName;
    file.uptdName = req.body.uptdName || file.uptdName;
    file.inputDate = req.body.inputDate || file.inputDate;
    file.fileAmount = req.body.fileAmount || file.fileAmount;
    file.boxNumber = req.body.boxNumber || file.boxNumber;
    file.description = req.body.description || file.description;
    file.updatedAt = Date.now();
    file.updatedBy = req.user.id;

    const updatedFile = await file.save();
    const populatedFile = await File.findById(updatedFile._id)
      .populate('createdBy', 'username fullName')
      .populate('updatedBy', 'username fullName');
    res.json(populatedFile);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete file (All authenticated users can delete - but save to history)
router.delete('/:id', auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id)
      .populate('createdBy', 'username fullName')
      .populate('updatedBy', 'username fullName');
    
    if (!file) return res.status(404).json({ message: 'File not found' });

    // Save to history before deleting
    const historyEntry = new History({
      fileName: file.fileName,
      uptdName: file.uptdName,
      inputDate: file.inputDate,
      fileAmount: file.fileAmount,
      boxNumber: file.boxNumber,
      description: file.description,
      createdBy: file.createdBy,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      updatedBy: file.updatedBy,
      deletedBy: req.user.id,
      action: 'deleted'
    });

    await historyEntry.save();
    await file.deleteOne();
    
    res.json({ message: 'File deleted and moved to history' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;