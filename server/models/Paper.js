const mongoose = require('mongoose');

const paperSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Paper title is required'],
    trim: true
  },
  examType: {
    type: String,
    enum: ['unit1', 'unit2', 'midterm', 'final', 'practice'],
    required: true
  },
  class: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['pdf', 'image'],
    required: true
  },
  originalName: {
    type: String
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Paper', paperSchema);
