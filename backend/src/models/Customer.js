const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['lead', 'customer', 'inactive'],
    default: 'lead'
  },
  statusHistory: [
    {
      status: {
        type: String,
        enum: ['lead', 'customer', 'inactive'],
        required: true
      },
      date: {
        type: Date,
        default: Date.now
      },
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      notes: String
    }
  ],
  notes: {
    type: String,
    trim: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastContact: {
    type: Date
  },
  tags: [{
    type: String,
    trim: true
  }],
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Index for search functionality
CustomerSchema.index({ 
  name: 'text', 
  email: 'text', 
  company: 'text',
  phone: 'text',
  notes: 'text',
  'address.city': 'text',
  'tags': 'text'
});

module.exports = mongoose.model('Customer', CustomerSchema); 