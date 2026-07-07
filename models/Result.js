const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  examinationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Examination',
    required: true
  },
  examName: {
    type: String,
    required: true,
    trim: true
  },
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
  subject: {
    type: String,
    required: true,
    trim: true
  },
  marksObtained: {
    type: Number,
    required: true
  },
  maxMarks: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pass', 'Fail'],
    default: 'Pass'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Result', resultSchema);
