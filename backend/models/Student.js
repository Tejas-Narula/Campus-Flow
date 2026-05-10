const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  grade: {
    type: String,
    required: true,
  },
  board: {
    type: String,
  },
  school: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['enrolled', 'past'],
    default: 'enrolled',
  },
  phone: {
    type: String,
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
