// In-memory store for feedback. For production, use a database (e.g., Vercel KV, PostgreSQL).
const feedbackStore = [];

// Add feedback to store
const addFeedback = (name, title, quote) => {
  const feedback = {
    id: Date.now().toString(), // Simple ID generation
    name: name || 'Anonymous',
    title: title || '',
    quote: quote || '',
    submittedAt: new Date().toISOString(),
  };
  feedbackStore.push(feedback);
  return feedback;
};

// Get all feedback
const getAllFeedback = () => {
  return feedbackStore.slice(); // Return a copy
};

// Get feedback by ID
const getFeedbackById = (id) => {
  return feedbackStore.find(f => f.id === id) || null;
};

export { addFeedback, getAllFeedback, getFeedbackById };

