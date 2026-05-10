const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
  },
  details: {
    type: String,
  }
}, { timestamps: true });

module.exports = mongoose.model('Institution', institutionSchema);
