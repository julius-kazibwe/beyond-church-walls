const mongoose = require('mongoose');

const endorsementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  quote: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['pastoral', 'feedback'],
    default: 'pastoral',
  },
  approved: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
endorsementSchema.index({ type: 1, approved: 1, createdAt: -1 });

module.exports = mongoose.models.Endorsement || mongoose.model('Endorsement', endorsementSchema);

