const mongoose = require('mongoose');

const weeklyContentSchema = new mongoose.Schema({
  weekNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  theme: {
    type: String,
    default: '',
  },
  keyScripture: {
    type: String,
    required: true,
  },
  keyScriptureText: {
    type: String,
    default: '',
  },
  learningObjective: {
    type: String,
    default: '',
  },
  startDate: {
    type: String,
    default: '',
  },
  endDate: {
    type: String,
    default: '',
  },
  // Study questions for reflection
  studyQuestions: {
    type: [{
      id: String,
      question: String,
    }],
    default: [],
  },
  // Reflection/Discussion questions
  reflectionQuestions: {
    type: [{
      id: String,
      question: String,
    }],
    default: [],
  },
  // Practical Application prompts/questions
  practicalApplications: {
    type: [{
      id: String,
      prompt: String,
      description: String, // Optional description or instructions
    }],
    default: [],
  },
  // Completion message shown after finishing the week
  completionMessage: {
    type: {
      title: {
        type: String,
        default: 'Congratulations!',
      },
      message: {
        type: String,
        default: '',
      },
    },
    default: {
      title: 'Congratulations!',
      message: "You've completed this week's study! Keep up the great work as you continue to integrate faith into your daily work.",
    },
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

// Note: weekNumber already has a unique index from the unique: true option above

module.exports = mongoose.models.WeeklyContent || mongoose.model('WeeklyContent', weeklyContentSchema);

