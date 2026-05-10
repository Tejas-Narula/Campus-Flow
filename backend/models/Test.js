const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: true
  },
  name: {
    type: String,
    required: true,
  },
  totalMarks: {
    type: Number,
    required: true,
  },
  targetGrades: [{
    type: String
  }],
  targetBoards: [{
    type: String
  }],
  targetSchools: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['not started', 'ongoing', 'finished'],
    default: 'not started'
  },
  date: {
    type: Date,
    default: Date.now
  },
  students: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    marksObtained: {
      type: Number,
      default: null
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Test', testSchema);
