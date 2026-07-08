const mongoose = require('mongoose');

const growthVideoSchema = new mongoose.Schema({
  youtubeId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['df-dscore', 'pledge', 'general'],
    default: 'general',
  },
  categoryLabel: {
    type: String,
    default: '',
  },
  url: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    default: '',
  },
  thumbnailFallback: {
    type: String,
    default: '',
  },
  featured: {
    type: Boolean,
    default: false,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
  published: {
    type: Boolean,
    default: true,
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

growthVideoSchema.index({ published: 1, sortOrder: 1, createdAt: -1 });
growthVideoSchema.index({ youtubeId: 1 });

module.exports = mongoose.models.GrowthVideo || mongoose.model('GrowthVideo', growthVideoSchema);
