const mongoose = require('mongoose');

const InteractionSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  type: {
    type: String,
    enum: ['email', 'call', 'meeting', 'note', 'other'],
    required: true
  },
  summary: {
    type: String,
    required: true,
    trim: true
  },
  details: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  duration: { // in minutes
    type: Number,
    min: 0
  },
  outcome: {
    type: String,
    enum: ['positive', 'negative', 'neutral', 'pending'],
    default: 'neutral'
  },
  nextAction: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Interaction', InteractionSchema); 