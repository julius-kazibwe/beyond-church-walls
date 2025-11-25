/**
 * Helper utility to enforce MongoDB priority in production
 * All storage utilities should use this helper
 */

const { getConnectionStatus } = require('./db');
const mongoose = require('mongoose');

/**
 * Check if MongoDB should be used (required in production)
 * @returns {boolean} true if MongoDB should be used
 */
const shouldUseMongoDB = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isConnected = getConnectionStatus();
  
  // In production, MongoDB is mandatory
  if (isProduction) {
    if (!isConnected) {
      // Check mongoose connection state directly as fallback
      const readyState = mongoose.connection.readyState;
      if (readyState === 1) {
        return true;
      }
      // In production, fail if MongoDB is not available
      throw new Error('MongoDB connection is required in production but is not available');
    }
    return true;
  }
  
  // In development, use MongoDB if available, otherwise allow file system
  return isConnected;
};

/**
 * Check if file system fallback is allowed
 * @returns {boolean} true if file system can be used
 */
const allowFileSystemFallback = () => {
  return process.env.NODE_ENV !== 'production';
};

module.exports = {
  shouldUseMongoDB,
  allowFileSystemFallback,
};







