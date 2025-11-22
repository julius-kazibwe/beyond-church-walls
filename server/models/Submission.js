const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['email-signup', 'pre-order', 'book-preview'],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
});

// Index for faster queries
submissionSchema.index({ type: 1, timestamp: -1 });

module.exports = mongoose.models.Submission || mongoose.model('Submission', submissionSchema);

