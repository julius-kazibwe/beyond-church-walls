const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
  },
  progress: {
    baselineCompleted: {
      type: Boolean,
      default: false,
    },
    baselineFRIQ: {
      type: Number,
      default: null,
    },
    completedWeeks: {
      type: [Number],
      default: [],
    },
    currentWeek: {
      type: Number,
      default: 0,
    },
    weeklyAssessments: {
      type: Map,
      of: Object,
      default: {},
    },
    assessments: {
      type: Map,
      of: Object,
      default: {},
    },
    reflections: {
      type: Map,
      of: Object,
      default: {},
    },
    practicalApplications: {
      type: Map,
      of: Object,
      default: {},
    },
  },
});

// Method to verify password
userSchema.methods.verifyPassword = async function(password) {
  return await bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);

