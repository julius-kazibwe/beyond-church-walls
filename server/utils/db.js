const mongoose = require('mongoose');

let isConnected = false;
let wasConnected = false;

// Set up connection event listeners for automatic reconnection detection
const setupConnectionListeners = () => {
  mongoose.connection.on('connected', () => {
    const justReconnected = !wasConnected && !isConnected;
    isConnected = true;
    
    if (justReconnected) {
      console.log('✅ MongoDB Atlas reconnected');
      console.log('🔄 Connection restored - syncing file system data...');
      
      // Trigger auto-sync after a short delay to ensure connection is stable
      setTimeout(() => {
        try {
          const { runSync } = require('./autoSync');
          runSync();
        } catch (error) {
          console.error('⚠️  Auto-sync error:', error.message);
        }
      }, 2000);
    } else {
      console.log('✅ MongoDB Atlas connected successfully');
    }
    
    wasConnected = true;
  });

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    wasConnected = false;
    console.warn('⚠️  MongoDB disconnected - using file-based storage fallback');
  });

  mongoose.connection.on('error', (error) => {
    isConnected = false;
    wasConnected = false;
    console.error('❌ MongoDB connection error:', error.message);
    console.warn('⚠️  Falling back to file-based storage');
  });
};

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      const isProduction = process.env.NODE_ENV === 'production';
      if (isProduction) {
        console.error('❌ MONGODB_URI is required in production!');
        throw new Error('MONGODB_URI must be set in production environment');
      }
      console.warn('⚠️  MONGODB_URI not set. Using file-based storage fallback.');
      wasConnected = false;
      return;
    }

    // Set up connection listeners (only once)
    if (!mongoose.connection.listeners('connected').length) {
      setupConnectionListeners();
    }

    await mongoose.connect(mongoURI);
    
    // Set isConnected immediately after successful connection
    // (connection event will also fire, but set it here for immediate use)
    if (mongoose.connection.readyState === 1) {
      isConnected = true;
      wasConnected = true;
    }
  } catch (error) {
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction) {
      console.error('❌ MongoDB connection failed in production!');
      console.error('   This is a critical error. Server may not function correctly.');
      throw error; // Fail fast in production
    }
    console.error('❌ MongoDB connection error:', error.message);
    console.warn('⚠️  Falling back to file-based storage');
    isConnected = false;
    wasConnected = false;
  }
};

const disconnectDB = async () => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('MongoDB disconnected');
  }
};

const getConnectionStatus = () => {
  // In production, always require MongoDB connection
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction && !isConnected) {
    // Check mongoose connection state directly
    const readyState = mongoose.connection.readyState;
    if (readyState === 1) { // 1 = connected
      isConnected = true;
      return true;
    }
    // In production, don't allow file system fallback
    return false;
  }
  return isConnected || mongoose.connection.readyState === 1;
};

module.exports = {
  connectDB,
  disconnectDB,
  getConnectionStatus,
};

