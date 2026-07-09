const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    trim: true,
    enum: ['college', 'labs', 'sports', 'cultural']
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  src: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Gallery', gallerySchema);
