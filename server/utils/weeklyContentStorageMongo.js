const WeeklyContent = require('../models/WeeklyContent');
const { getConnectionStatus } = require('./db');
const weeklyContentStorage = require('./weeklyContentStorage'); // Fallback

const getAllWeeklyContent = async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const useMongoDB = getConnectionStatus();
  
  if (isProduction && !useMongoDB) {
    throw new Error('MongoDB connection required in production.');
  }
  
  if (useMongoDB) {
    const weeks = await WeeklyContent.find().sort({ weekNumber: 1 });
    const content = {};
    weeks.forEach(week => {
      // Convert completionMessage to proper format if it's a string
      let completionMessage = week.completionMessage || {};
      if (typeof completionMessage === 'string') {
        completionMessage = {
          title: 'Congratulations!',
          message: completionMessage || "You've completed this week's study! Keep up the great work as you continue to integrate faith into your daily work.",
        };
      }
      if (!completionMessage.title) {
        completionMessage.title = 'Congratulations!';
      }
      if (!completionMessage.message) {
        completionMessage.message = "You've completed this week's study! Keep up the great work as you continue to integrate faith into your daily work.";
      }

      content[week.weekNumber] = {
        weekNumber: week.weekNumber,
        title: week.title || '',
        theme: week.theme || '',
        learningObjective: week.learningObjective || '',
        keyScripture: week.keyScripture || '',
        keyScriptureText: week.keyScriptureText || '',
        startDate: week.startDate || '',
        endDate: week.endDate || '',
        studyQuestions: Array.isArray(week.studyQuestions) ? week.studyQuestions : [],
        reflectionQuestions: Array.isArray(week.reflectionQuestions) ? week.reflectionQuestions : [],
        practicalApplications: Array.isArray(week.practicalApplications) ? week.practicalApplications : [],
        completionMessage: completionMessage,
      };
    });
    return content;
  }
  
  if (!isProduction) {
    return weeklyContentStorage.getAllWeeklyContent();
  }
  
  throw new Error('Storage system unavailable');
};

const getWeekContent = async (weekNumber) => {
  if (getConnectionStatus()) {
    const week = await WeeklyContent.findOne({ weekNumber });
    if (!week) return null;
    
    // Convert completionMessage to proper format if it's a string
    let completionMessage = week.completionMessage || {};
    if (typeof completionMessage === 'string') {
      completionMessage = {
        title: 'Congratulations!',
        message: completionMessage || "You've completed this week's study! Keep up the great work as you continue to integrate faith into your daily work.",
      };
    }
    if (!completionMessage.title) {
      completionMessage.title = 'Congratulations!';
    }
    if (!completionMessage.message) {
      completionMessage.message = "You've completed this week's study! Keep up the great work as you continue to integrate faith into your daily work.";
    }
    
    return {
      weekNumber: week.weekNumber,
      title: week.title || '',
      theme: week.theme || '',
      learningObjective: week.learningObjective || '',
      keyScripture: week.keyScripture || '',
      keyScriptureText: week.keyScriptureText || '',
      startDate: week.startDate || '',
      endDate: week.endDate || '',
      studyQuestions: Array.isArray(week.studyQuestions) ? week.studyQuestions : [],
      reflectionQuestions: Array.isArray(week.reflectionQuestions) ? week.reflectionQuestions : [],
      practicalApplications: Array.isArray(week.practicalApplications) ? week.practicalApplications : [],
      completionMessage: completionMessage,
    };
  }
  return weeklyContentStorage.getWeekContent(weekNumber);
};

const saveWeeklyContent = async (weekNumber, weekData) => {
  if (getConnectionStatus()) {
    // Ensure completionMessage is in the correct format
    let completionMessage = weekData.completionMessage || {};
    if (typeof completionMessage === 'string') {
      completionMessage = {
        title: 'Congratulations!',
        message: completionMessage || "You've completed this week's study! Keep up the great work as you continue to integrate faith into your daily work.",
      };
    }
    if (!completionMessage.title) {
      completionMessage.title = 'Congratulations!';
    }
    if (!completionMessage.message) {
      completionMessage.message = "You've completed this week's study! Keep up the great work as you continue to integrate faith into your daily work.";
    }

    // Ensure arrays are properly formatted
    const studyQuestions = Array.isArray(weekData.studyQuestions) 
      ? weekData.studyQuestions 
      : [];
    const reflectionQuestions = Array.isArray(weekData.reflectionQuestions) 
      ? weekData.reflectionQuestions 
      : [];
    const practicalApplications = Array.isArray(weekData.practicalApplications) 
      ? weekData.practicalApplications 
      : [];

    const week = await WeeklyContent.findOneAndUpdate(
      { weekNumber: weekNumber },
      {
        weekNumber: weekNumber,
        title: weekData.title || '',
        theme: weekData.theme || '',
        learningObjective: weekData.learningObjective || '',
        keyScripture: weekData.keyScripture || '',
        keyScriptureText: weekData.keyScriptureText || '',
        startDate: weekData.startDate || '',
        endDate: weekData.endDate || '',
        studyQuestions: studyQuestions,
        reflectionQuestions: reflectionQuestions,
        practicalApplications: practicalApplications,
        completionMessage: completionMessage,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );
    
    // Convert completionMessage for response
    let responseCompletionMessage = week.completionMessage || {};
    if (typeof responseCompletionMessage === 'string') {
      responseCompletionMessage = {
        title: 'Congratulations!',
        message: responseCompletionMessage,
      };
    }
    
    return {
      weekNumber: week.weekNumber,
      title: week.title || '',
      theme: week.theme || '',
      learningObjective: week.learningObjective || '',
      keyScripture: week.keyScripture || '',
      keyScriptureText: week.keyScriptureText || '',
      startDate: week.startDate || '',
      endDate: week.endDate || '',
      studyQuestions: Array.isArray(week.studyQuestions) ? week.studyQuestions : [],
      reflectionQuestions: Array.isArray(week.reflectionQuestions) ? week.reflectionQuestions : [],
      practicalApplications: Array.isArray(week.practicalApplications) ? week.practicalApplications : [],
      completionMessage: responseCompletionMessage,
    };
  }
  return weeklyContentStorage.saveWeeklyContent(weekNumber, weekData);
};

const deleteWeek = async (weekNumber) => {
  if (getConnectionStatus()) {
    await WeeklyContent.findOneAndDelete({ weekNumber });
    return;
  }
  return weeklyContentStorage.deleteWeek(weekNumber);
};

module.exports = {
  getAllWeeklyContent,
  getWeekContent,
  saveWeeklyContent,
  deleteWeek,
};

