const Feedback = require('../models/Feedback');
const { getConnectionStatus } = require('./db');
const feedbackStorage = require('./feedbackStorage'); // Fallback

const getAllFeedback = async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const useMongoDB = getConnectionStatus();
  
  if (isProduction && !useMongoDB) {
    throw new Error('MongoDB connection required in production.');
  }
  
  if (useMongoDB) {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    return feedback.map(f => ({
      id: f._id.toString(),
      name: f.name,
      email: f.email,
      title: f.title,
      message: f.message,
      approved: f.approved,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
    }));
  }
  
  if (!isProduction) {
    return feedbackStorage.getAllFeedback();
  }
  
  throw new Error('Storage system unavailable');
};

const getApprovedFeedback = async () => {
  if (getConnectionStatus()) {
    const feedback = await Feedback.find({ approved: true }).sort({ createdAt: -1 });
    
    return feedback.map(f => {
      // Get message - check if it exists and is not empty
      const messageValue = f.message || f.quote || '';
      
      return {
        id: f._id.toString(),
        name: f.name || '',
        email: f.email || '',
        title: f.title || '',
        message: messageValue, // Use message field, fallback to quote for legacy data
        approved: f.approved,
        createdAt: f.createdAt,
      };
    });
  }
  return feedbackStorage.getApprovedFeedback();
};

const addFeedback = async (feedbackData) => {
  if (getConnectionStatus()) {
    const feedback = new Feedback({
      ...feedbackData,
      approved: false,
    });
    await feedback.save();
    return {
      id: feedback._id.toString(),
      name: feedback.name,
      email: feedback.email,
      title: feedback.title,
      message: feedback.message,
      approved: feedback.approved,
      createdAt: feedback.createdAt,
    };
  }
  // File-based storage expects individual parameters, so convert object
  // Handle both object format and legacy parameter format
  if (typeof feedbackData === 'object' && feedbackData !== null) {
    return feedbackStorage.addFeedback(
      feedbackData.name || '',
      feedbackData.title || '',
      feedbackData.message || feedbackData.quote || '',
      feedbackData.email || ''
    );
  }
  // Legacy format (individual parameters) - shouldn't happen but handle it
  return feedbackStorage.addFeedback(
    feedbackData || '',
    '',
    '',
    ''
  );
};

const updateFeedbackApproval = async (id, approved) => {
  if (getConnectionStatus()) {
    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { approved, updatedAt: new Date() },
      { new: true }
    );
    if (!feedback) throw new Error('Feedback not found');
    return {
      id: feedback._id.toString(),
      name: feedback.name,
      email: feedback.email,
      title: feedback.title,
      message: feedback.message,
      approved: feedback.approved,
      createdAt: feedback.createdAt,
    };
  }
  return feedbackStorage.updateFeedbackApproval(id, approved);
};

const deleteFeedback = async (id) => {
  if (getConnectionStatus()) {
    await Feedback.findByIdAndDelete(id);
    return;
  }
  return feedbackStorage.deleteFeedback(id);
};

module.exports = {
  getAllFeedback,
  getApprovedFeedback,
  addFeedback,
  updateFeedbackApproval,
  deleteFeedback,
};

