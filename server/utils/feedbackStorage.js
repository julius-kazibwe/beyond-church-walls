const fs = require('fs').promises;
const path = require('path');

const feedbackFile = path.join(__dirname, '..', 'data', 'feedback.json');

// Default feedback (initial feedback displayed on home page)
const defaultFeedback = [
  {
    id: '1',
    name: "His Worship Elias Kakooza",
    title: "Chief Magistrate, Nakawa Chief Magistrate's Court – Uganda",
    quote: "Beyond Church Walls is timely and transformational, restoring the believer's understanding of calling and showing that ministry extends to every sphere of life.",
    email: '',
    submittedAt: new Date('2024-01-01').toISOString(),
    approved: true,
    approvedAt: new Date('2024-01-01').toISOString()
  },
  {
    id: '2',
    name: "Dr. Olivia Kasirye",
    title: "Public Health Physician & Ministry Partner – Sacramento, California",
    quote: "This book restores the sacred connection between faith and daily work, calling believers to live with integrity, compassion, and excellence wherever God has placed them.",
    email: '',
    submittedAt: new Date('2024-01-02').toISOString(),
    approved: true,
    approvedAt: new Date('2024-01-02').toISOString()
  },
  {
    id: '3',
    name: "Elizabeth Baleke",
    title: "Global Outreach International",
    quote: "In a generation searching for identity and purpose, Beyond Church Walls shines as a beacon of truth and hope—guiding readers to live with significance in God's service.",
    email: '',
    submittedAt: new Date('2024-01-03').toISOString(),
    approved: true,
    approvedAt: new Date('2024-01-03').toISOString()
  },
  {
    id: '4',
    name: "Mr. Samuel Turyahikayo",
    title: "National Director, Scripture Union Uganda",
    quote: "A timely call to bridge faith and daily work, Beyond Church Walls equips believers to see work as sacred service and live with purpose, faith, and excellence.",
    email: '',
    submittedAt: new Date('2024-01-04').toISOString(),
    approved: true,
    approvedAt: new Date('2024-01-04').toISOString()
  }
];

// Ensure feedback file exists
const ensureFeedbackFile = async () => {
  try {
    await fs.access(feedbackFile);
    // Check if file is empty or doesn't have the default feedback
    const data = await fs.readFile(feedbackFile, 'utf8');
    const existingFeedback = JSON.parse(data);
    
    // If file is empty, initialize with default feedback
    if (existingFeedback.length === 0) {
      await fs.writeFile(feedbackFile, JSON.stringify(defaultFeedback, null, 2));
      return;
    }
    
    // Check if default feedback IDs exist, if not, add them
    const existingIds = existingFeedback.map(f => f.id);
    const missingDefaults = defaultFeedback.filter(f => !existingIds.includes(f.id));
    
    if (missingDefaults.length > 0) {
      const updatedFeedback = [...existingFeedback, ...missingDefaults];
      await fs.writeFile(feedbackFile, JSON.stringify(updatedFeedback, null, 2));
    }
  } catch {
    // Create with default feedback if file doesn't exist
    await fs.writeFile(feedbackFile, JSON.stringify(defaultFeedback, null, 2));
  }
};

// Get all feedback
const getAllFeedback = async () => {
  await ensureFeedbackFile();
  try {
    const data = await fs.readFile(feedbackFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Get approved feedback only
const getApprovedFeedback = async () => {
  const allFeedback = await getAllFeedback();
  return allFeedback.filter(f => f.approved === true);
};

// Add feedback
const addFeedback = async (name, title, quote, email) => {
  await ensureFeedbackFile();
  const feedback = {
    id: Date.now().toString(),
    name: name || 'Anonymous',
    title: title || '',
    quote: quote || '',
    email: email || '',
    submittedAt: new Date().toISOString(),
    approved: false // Default to not approved
  };
  
  const allFeedback = await getAllFeedback();
  allFeedback.push(feedback);
  await fs.writeFile(feedbackFile, JSON.stringify(allFeedback, null, 2));
  return feedback;
};

// Update feedback approval status
const updateFeedbackApproval = async (id, approved) => {
  await ensureFeedbackFile();
  const allFeedback = await getAllFeedback();
  const index = allFeedback.findIndex(f => f.id === id);
  if (index !== -1) {
    allFeedback[index].approved = approved;
    allFeedback[index].approvedAt = approved ? new Date().toISOString() : null;
    await fs.writeFile(feedbackFile, JSON.stringify(allFeedback, null, 2));
    return allFeedback[index];
  }
  return null;
};

// Delete feedback
const deleteFeedback = async (id) => {
  await ensureFeedbackFile();
  const allFeedback = await getAllFeedback();
  const filtered = allFeedback.filter(f => f.id !== id);
  await fs.writeFile(feedbackFile, JSON.stringify(filtered, null, 2));
  return true;
};

module.exports = {
  getAllFeedback,
  getApprovedFeedback,
  addFeedback,
  updateFeedbackApproval,
  deleteFeedback,
};

