const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');

const usersDir = path.join(__dirname, '..', 'data', 'users');
const usersIndexFile = path.join(usersDir, 'index.json');

// Ensure users directory exists
const ensureUsersDir = async () => {
  await fs.mkdir(usersDir, { recursive: true });
  try {
    await fs.access(usersIndexFile);
  } catch {
    // Create index file if it doesn't exist
    await fs.writeFile(usersIndexFile, JSON.stringify({ users: [] }, null, 2));
  }
};

// Get user index
const getUserIndex = async () => {
  await ensureUsersDir();
  try {
    const data = await fs.readFile(usersIndexFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { users: [] };
  }
};

// Save user index
const saveUserIndex = async (index) => {
  await ensureUsersDir();
  await fs.writeFile(usersIndexFile, JSON.stringify(index, null, 2));
};

// Get user file path
const getUserFilePath = (userId) => {
  return path.join(usersDir, `${userId}.json`);
};

// Create a new user
const createUser = async (email, password, name = '') => {
  await ensureUsersDir();
  
  // Check if user already exists
  const index = await getUserIndex();
  const existingUser = index.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    throw new Error('User already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Create user ID
  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Create user object
  const user = {
    id: userId,
    email: email.toLowerCase(),
    name: name || email.split('@')[0],
    password: hashedPassword,
    createdAt: new Date().toISOString(),
    lastLogin: null,
    progress: {
      baselineCompleted: false,
      baselineFRIQ: null,
      completedWeeks: [],
      assessments: {},
      currentWeek: 0,
      reflections: {},
      practicalApplications: {}
    }
  };

  // Save user file
  await fs.writeFile(getUserFilePath(userId), JSON.stringify(user, null, 2));

  // Update index
  index.users.push({
    id: userId,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt
  });
  await saveUserIndex(index);

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// Find user by email
const findUserByEmail = async (email) => {
  await ensureUsersDir();
  const index = await getUserIndex();
  const userEntry = index.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!userEntry) {
    return null;
  }

  try {
    const userData = await fs.readFile(getUserFilePath(userEntry.id), 'utf8');
    return JSON.parse(userData);
  } catch (error) {
    return null;
  }
};

// Find user by ID
const findUserById = async (userId) => {
  await ensureUsersDir();
  try {
    const userData = await fs.readFile(getUserFilePath(userId), 'utf8');
    const user = JSON.parse(userData);
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    return null;
  }
};

// Verify password
const verifyPassword = async (user, password) => {
  return await bcrypt.compare(password, user.password);
};

// Update user last login
const updateLastLogin = async (userId) => {
  try {
    const user = await findUserById(userId);
    if (!user) return;
    
    const userData = await fs.readFile(getUserFilePath(userId), 'utf8');
    const fullUser = JSON.parse(userData);
    fullUser.lastLogin = new Date().toISOString();
    
    await fs.writeFile(getUserFilePath(userId), JSON.stringify(fullUser, null, 2));
  } catch (error) {
    console.error('Error updating last login:', error);
  }
};

// Save user progress
const saveUserProgress = async (userId, progress) => {
  try {
    const userData = await fs.readFile(getUserFilePath(userId), 'utf8');
    const user = JSON.parse(userData);
    user.progress = { ...user.progress, ...progress };
    await fs.writeFile(getUserFilePath(userId), JSON.stringify(user, null, 2));
    return user.progress;
  } catch (error) {
    console.error('Error saving user progress:', error);
    throw error;
  }
};

// Get user progress
const getUserProgress = async (userId) => {
  try {
    const user = await findUserById(userId);
    return user ? user.progress : null;
  } catch (error) {
    console.error('Error getting user progress:', error);
    return null;
  }
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  verifyPassword,
  updateLastLogin,
  saveUserProgress,
  getUserProgress,
};

