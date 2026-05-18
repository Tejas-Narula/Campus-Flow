const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  grade: {
    type: String,
  },
  board: {
    type: String,
  },
  batch: {
    type: String,
  },
  school: {
    type: String,
  },
  status: {
    type: String,
    enum: ['enrolled', 'past'],
    default: 'enrolled',
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  parentsName: {
    type: String,
  },
  parentsPhone: {
    type: String,
  },
  birthDate: {
    type: Date,
  },
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
