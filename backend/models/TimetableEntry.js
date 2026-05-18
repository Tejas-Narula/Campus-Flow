const mongoose = require('mongoose');

const timetableEntrySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true, // Format: HH:mm
  },
  endTime: {
    type: String,
    required: true, // Format: HH:mm
  },
  batch: {
    type: String,
    required: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
  },
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('TimetableEntry', timetableEntrySchema);
