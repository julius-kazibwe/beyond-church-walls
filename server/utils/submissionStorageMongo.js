const Submission = require('../models/Submission');
const { getConnectionStatus } = require('./db');
const fs = require('fs').promises;
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

const saveSubmission = async (type, data) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const useMongoDB = getConnectionStatus();
  
  // In production, MongoDB is required
  if (isProduction && !useMongoDB) {
    throw new Error('MongoDB connection required in production. Cannot save submission.');
  }
  
  if (useMongoDB) {
    const submission = new Submission({
      type,
      data,
      timestamp: new Date(),
    });
    await submission.save();
    return {
      type: submission.type,
      timestamp: submission.timestamp,
      data: submission.data,
    };
  }
  
  // Only allow file system fallback in development
  if (!isProduction) {
    const timestamp = new Date().toISOString();
    const submission = {
      type,
      timestamp,
      data,
    };
    const filePath = path.join(dataDir, `${type}-${Date.now()}.json`);
    await fs.writeFile(filePath, JSON.stringify(submission, null, 2));
    return submission;
  }
  
  throw new Error('Storage system unavailable');
};

const getSubmissions = async (type) => {
  if (getConnectionStatus()) {
    const query = type ? { type } : {};
    const submissions = await Submission.find(query).sort({ timestamp: -1 });
    return submissions.map(sub => ({
      type: sub.type,
      timestamp: sub.timestamp,
      data: sub.data,
    }));
  }
  // Fallback to file-based
  const files = await fs.readdir(dataDir);
  const submissionFiles = files.filter(f => 
    type ? f.startsWith(`${type}-`) : f.includes('-') && f.endsWith('.json')
  );
  
  const submissions = [];
  for (const file of submissionFiles) {
    try {
      const content = await fs.readFile(path.join(dataDir, file), 'utf8');
      const submission = JSON.parse(content);
      submissions.push(submission);
    } catch (error) {
      console.error(`Error reading submission file ${file}:`, error);
    }
  }
  
  return submissions.sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );
};

module.exports = {
  saveSubmission,
  getSubmissions,
};

