const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');
const { getConnectionStatus } = require('./db');
const adminStorage = require('./adminStorage'); // Fallback to file-based

const getAllAdmins = async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const useMongoDB = getConnectionStatus();
  
  if (isProduction && !useMongoDB) {
    throw new Error('MongoDB connection required in production.');
  }
  
  if (useMongoDB) {
    const admins = await Admin.find().select('-passwordHash');
    return admins.map(admin => ({
      id: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      createdAt: admin.createdAt,
      lastLogin: admin.lastLogin,
    }));
  }
  
  if (!isProduction) {
    return adminStorage.getAllAdmins();
  }
  
  throw new Error('Storage system unavailable');
};

const getAdmin = async (email) => {
  if (getConnectionStatus()) {
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) return null;
    return {
      id: admin._id.toString(),
      email: admin.email,
      passwordHash: admin.passwordHash,
      name: admin.name,
      createdAt: admin.createdAt,
      lastLogin: admin.lastLogin,
    };
  }
  return adminStorage.getAdmin(email);
};

const verifyAdminPassword = async (admin, password) => {
  if (getConnectionStatus()) {
    // If admin is a MongoDB document, use its method
    if (admin.verifyPassword && typeof admin.verifyPassword === 'function') {
      return await admin.verifyPassword(password);
    }
    // Otherwise, admin is a plain object with passwordHash
    const bcrypt = require('bcrypt');
    return await bcrypt.compare(password, admin.passwordHash);
  }
  return adminStorage.verifyAdminPassword(admin, password);
};

const updateAdminLastLogin = async (adminIdOrEmail) => {
  if (getConnectionStatus()) {
    // Handle both ID and email - try ID first, then email
    let admin;
    // Check if it's a valid ObjectId format (24 hex characters)
    if (adminIdOrEmail && adminIdOrEmail.length === 24 && /^[0-9a-fA-F]{24}$/.test(adminIdOrEmail)) {
      admin = await Admin.findByIdAndUpdate(adminIdOrEmail, { lastLogin: new Date() });
    } else {
      // If not a valid ObjectId, treat it as email
      admin = await Admin.findOneAndUpdate(
        { email: adminIdOrEmail.toLowerCase() },
        { lastLogin: new Date() }
      );
    }
    return admin;
  }
  return adminStorage.updateAdminLastLogin(adminIdOrEmail);
};

const createAdmin = async (email, password, name = 'Admin') => {
  if (getConnectionStatus()) {
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      const admin = new Admin({
        email,
        passwordHash,
        name,
      });
      await admin.save();
      return {
        id: admin._id.toString(),
        email: admin.email,
        name: admin.name,
        createdAt: admin.createdAt,
      };
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Admin email already exists');
      }
      throw error;
    }
  }
  throw new Error('MongoDB not connected. Cannot create admin.');
};

module.exports = {
  getAllAdmins,
  getAdmin,
  verifyAdminPassword,
  updateAdminLastLogin,
  createAdmin,
};

