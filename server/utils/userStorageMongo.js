const bcrypt = require('bcrypt');
const User = require('../models/User');
const { getConnectionStatus } = require('./db');
const userStorage = require('./userStorage'); // Fallback to file-based

const createUser = async (email, password, name = '') => {
  const isProduction = process.env.NODE_ENV === 'production';
  const useMongoDB = getConnectionStatus();
  
  // In production, MongoDB is required
  if (isProduction && !useMongoDB) {
    throw new Error('MongoDB connection required in production. Cannot create user.');
  }
  
  if (useMongoDB) {
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      const user = new User({
        email,
        passwordHash,
        name,
      });
      await user.save();
      return {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      };
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Email already exists');
      }
      throw error;
    }
  }
  
  // Only allow file system fallback in development
  if (!isProduction) {
    return userStorage.createUser(email, password, name);
  }
  
  throw new Error('Storage system unavailable');
};

const findUserByEmail = async (email) => {
  if (getConnectionStatus()) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return null;
    return {
      id: user._id.toString(),
      email: user.email,
      passwordHash: user.passwordHash,
      name: user.name,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    };
  }
  return userStorage.findUserByEmail(email);
};

const findUserById = async (id) => {
  if (getConnectionStatus()) {
    const user = await User.findById(id);
    if (!user) return null;
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    };
  }
  return userStorage.findUserById(id);
};

const verifyPassword = async (user, password) => {
  if (getConnectionStatus()) {
    // If user is a MongoDB document, use its method
    if (user.verifyPassword && typeof user.verifyPassword === 'function') {
      return await user.verifyPassword(password);
    }
    // Otherwise, user is a plain object with passwordHash
    const bcrypt = require('bcrypt');
    return await bcrypt.compare(password, user.passwordHash);
  }
  return userStorage.verifyPassword(user, password);
};

const updateLastLogin = async (userId) => {
  if (getConnectionStatus()) {
    await User.findByIdAndUpdate(userId, { lastLogin: new Date() });
    return;
  }
  return userStorage.updateLastLogin(userId);
};

// Helper function to convert Mongoose Map to plain object
const mapToObject = (map) => {
  if (!map) return {};
  if (map instanceof Map) {
    const obj = {};
    for (const [key, value] of map.entries()) {
      // Skip Mongoose internal properties
      if (key && !key.startsWith('$')) {
        obj[key] = value;
      }
    }
    return obj;
  }
  // If it's already an object, clean it
  if (typeof map === 'object' && map !== null) {
    const obj = {};
    for (const [key, value] of Object.entries(map)) {
      // Skip Mongoose internal properties
      if (key && !key.startsWith('$')) {
        obj[key] = value;
      }
    }
    return obj;
  }
  return {};
};

// Helper function to clean progress data - remove Mongoose internal properties
const cleanProgressData = (progress) => {
  if (!progress || typeof progress !== 'object') {
    return {
      baselineCompleted: false,
      baselineFRIQ: null,
      completedWeeks: [],
      currentWeek: 0,
      weeklyAssessments: {},
      assessments: {},
      reflections: {},
      practicalApplications: {},
    };
  }

  // Clean assessments - could be in weeklyAssessments or assessments
  let assessments = {};
  if (progress.weeklyAssessments) {
    assessments = mapToObject(progress.weeklyAssessments);
  } else if (progress.assessments) {
    assessments = mapToObject(progress.assessments);
  }

  return {
    baselineCompleted: progress.baselineCompleted !== undefined ? progress.baselineCompleted : (progress.baselineFRIQ !== null && progress.baselineFRIQ !== undefined),
    baselineFRIQ: typeof progress.baselineFRIQ === 'number' ? progress.baselineFRIQ : null,
    completedWeeks: Array.isArray(progress.completedWeeks) ? progress.completedWeeks : [],
    currentWeek: typeof progress.currentWeek === 'number' ? progress.currentWeek : 0,
    weeklyAssessments: assessments,
    assessments: assessments,
    reflections: mapToObject(progress.reflections || {}),
    practicalApplications: mapToObject(progress.practicalApplications || {}),
  };
};

const saveUserProgress = async (userId, progress) => {
  if (getConnectionStatus()) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    
    // Clean the progress data to remove any Mongoose internal properties
    const cleanedProgress = cleanProgressData(progress);
    
    // Set progress fields - Mongoose will convert plain objects to Maps automatically
    user.progress.baselineCompleted = cleanedProgress.baselineCompleted;
    user.progress.baselineFRIQ = cleanedProgress.baselineFRIQ;
    user.progress.completedWeeks = cleanedProgress.completedWeeks;
    user.progress.currentWeek = cleanedProgress.currentWeek;
    
    // Clear and set Maps from plain objects
    user.progress.weeklyAssessments = new Map();
    user.progress.assessments = new Map();
    for (const [key, value] of Object.entries(cleanedProgress.assessments || {})) {
      user.progress.weeklyAssessments.set(key, value);
      user.progress.assessments.set(key, value);
    }
    
    user.progress.reflections = new Map();
    for (const [key, value] of Object.entries(cleanedProgress.reflections || {})) {
      user.progress.reflections.set(key, value);
    }
    
    user.progress.practicalApplications = new Map();
    for (const [key, value] of Object.entries(cleanedProgress.practicalApplications || {})) {
      user.progress.practicalApplications.set(key, value);
    }
    
    await user.save();
    
    // Return cleaned progress (as plain objects for API response)
    return {
      baselineCompleted: cleanedProgress.baselineCompleted,
      baselineFRIQ: cleanedProgress.baselineFRIQ,
      completedWeeks: cleanedProgress.completedWeeks,
      currentWeek: cleanedProgress.currentWeek,
      assessments: cleanedProgress.assessments,
      reflections: cleanedProgress.reflections,
      practicalApplications: cleanedProgress.practicalApplications,
    };
  }
  return userStorage.saveUserProgress(userId, progress);
};

const getUserProgress = async (userId) => {
  if (getConnectionStatus()) {
    const user = await User.findById(userId);
    if (!user) return null;
    
    // Convert Maps to plain objects, handling both Map and object types
    const progress = user.progress || {};
    
    // Handle assessments - could be in weeklyAssessments or assessments
    let assessments = {};
    if (progress.weeklyAssessments) {
      assessments = mapToObject(progress.weeklyAssessments);
    } else if (progress.assessments) {
      assessments = typeof progress.assessments === 'object' ? progress.assessments : {};
    }
    
    return {
      baselineCompleted: progress.baselineCompleted !== undefined ? progress.baselineCompleted : (progress.baselineFRIQ !== null && progress.baselineFRIQ !== undefined),
      baselineFRIQ: progress.baselineFRIQ || null,
      completedWeeks: progress.completedWeeks || [],
      assessments: assessments,
      currentWeek: progress.currentWeek || 0,
      reflections: mapToObject(progress.reflections || {}),
      practicalApplications: mapToObject(progress.practicalApplications || {}),
    };
  }
  return userStorage.getUserProgress(userId);
};

const getAllUsers = async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const useMongoDB = getConnectionStatus();
  
  if (isProduction && !useMongoDB) {
    throw new Error('MongoDB connection required in production.');
  }
  
  if (useMongoDB) {
    const users = await User.find().sort({ createdAt: -1 });
    return users.map(user => {
      // Convert progress Maps to plain objects
      const progress = user.progress || {};
      
      // Handle assessments
      let assessments = {};
      if (progress.weeklyAssessments) {
        assessments = mapToObject(progress.weeklyAssessments);
      } else if (progress.assessments) {
        assessments = mapToObject(progress.assessments);
      }
      
      return {
        id: user._id.toString(),
        email: user.email,
        name: user.name || '',
        createdAt: user.createdAt,
        lastLogin: user.lastLogin || null,
        progress: {
          baselineCompleted: progress.baselineCompleted !== undefined ? progress.baselineCompleted : (progress.baselineFRIQ !== null && progress.baselineFRIQ !== undefined),
          baselineFRIQ: progress.baselineFRIQ || null,
          completedWeeks: Array.isArray(progress.completedWeeks) ? progress.completedWeeks : [],
          currentWeek: progress.currentWeek || 0,
          assessments: assessments,
          reflections: mapToObject(progress.reflections || {}),
          practicalApplications: mapToObject(progress.practicalApplications || {}),
        }
      };
    });
  }
  
  if (!isProduction) {
    // Fallback to file-based storage
    const fs = require('fs').promises;
    const path = require('path');
    const usersIndexFile = path.join(__dirname, '..', 'data', 'users', 'index.json');
    let index = { users: [] };
    try {
      const indexData = await fs.readFile(usersIndexFile, 'utf8');
      index = JSON.parse(indexData);
    } catch (e) {
      return [];
    }
    
    const users = [];
    for (const userEntry of index.users) {
      try {
        const user = await findUserById(userEntry.id);
        const progress = await getUserProgress(userEntry.id);
        if (user) {
          users.push({
            ...user,
            progress: progress || {}
          });
        }
      } catch (e) {
        console.error(`Error loading user ${userEntry.id}:`, e);
      }
    }
    return users;
  }
  
  throw new Error('Storage system unavailable');
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  verifyPassword,
  updateLastLogin,
  saveUserProgress,
  getUserProgress,
  getAllUsers,
};

