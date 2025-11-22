const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');

const adminFile = path.join(__dirname, '..', 'data', 'admin.json');
const adminsFile = path.join(__dirname, '..', 'data', 'admins.json'); // Multiple admins

// Ensure admin file exists (for backward compatibility)
const ensureAdminFile = async () => {
  try {
    await fs.access(adminFile);
  } catch {
    // Create default admin if file doesn't exist
    const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123'; // Change in production!
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    const admin = {
      email: process.env.ADMIN_EMAIL || 'admin@beyondchurchwalls.com',
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      lastLogin: null
    };
    await fs.writeFile(adminFile, JSON.stringify(admin, null, 2));
    console.log('⚠️  Default admin created. Please change the password!');
  }
};

// Get all admins (from new multi-admin file or legacy single admin file)
const getAllAdmins = async () => {
  try {
    // Try to read from new multi-admin file
    try {
      const data = await fs.readFile(adminsFile, 'utf8');
      return JSON.parse(data);
    } catch {
      // Fall back to single admin file
      await ensureAdminFile();
      try {
        const data = await fs.readFile(adminFile, 'utf8');
        const admin = JSON.parse(data);
        return [admin]; // Return as array for consistency
      } catch {
        return [];
      }
    }
  } catch (error) {
    return [];
  }
};

// Get admin by email
const getAdmin = async (email) => {
  const admins = await getAllAdmins();
  if (!email) {
    // For backward compatibility, return first admin
    return admins.length > 0 ? admins[0] : null;
  }
  return admins.find(a => a.email.toLowerCase() === email.toLowerCase()) || null;
};

// Verify admin password
const verifyAdminPassword = async (admin, password) => {
  return await bcrypt.compare(password, admin.password);
};

// Update admin last login
const updateAdminLastLogin = async (email) => {
  try {
    const admins = await getAllAdmins();
    const admin = admins.find(a => a.email.toLowerCase() === (email || '').toLowerCase());
    if (admin) {
      admin.lastLogin = new Date().toISOString();
      
      // Save to appropriate file
      if (admins.length > 1 || await fs.access(adminsFile).then(() => true).catch(() => false)) {
        await fs.writeFile(adminsFile, JSON.stringify(admins, null, 2));
      } else {
        await fs.writeFile(adminFile, JSON.stringify(admin, null, 2));
      }
    }
  } catch (error) {
    console.error('Error updating admin last login:', error);
  }
};

// Change admin password
const changeAdminPassword = async (email, newPassword) => {
  try {
    const admins = await getAllAdmins();
    const admin = admins.find(a => a.email.toLowerCase() === (email || '').toLowerCase());
    if (admin) {
      admin.password = await bcrypt.hash(newPassword, 10);
      
      // Save to appropriate file
      if (admins.length > 1 || await fs.access(adminsFile).then(() => true).catch(() => false)) {
        await fs.writeFile(adminsFile, JSON.stringify(admins, null, 2));
      } else {
        await fs.writeFile(adminFile, JSON.stringify(admin, null, 2));
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error changing admin password:', error);
    return false;
  }
};

module.exports = {
  getAdmin,
  getAllAdmins,
  verifyAdminPassword,
  updateAdminLastLogin,
  changeAdminPassword,
};

