const mongoose = require('mongoose');

const placementEnquirySchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  rollNo: {
    type: String,
    required: true,
    trim: true
  },
  college: {
    type: String,
    required: true,
    trim: true
  },
  group: {
    type: String,
    required: true,
    trim: true
  },
  cgpa: {
    type: Number,
    required: true
  },
  backlogs: {
    type: Number,
    default: 0
  },
  resumeLink: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    default: 'Pending',
    enum: ['Pending', 'Under Review', 'Shortlisted', 'Placed', 'Rejected']
  },
  package: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PlacementEnquiry', placementEnquirySchema);
