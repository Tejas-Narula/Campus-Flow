const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String }, // text as question
  batch: { type: String },
  institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  attachments: [{ type: String }], // URLs or paths to uploaded files
  dueDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
