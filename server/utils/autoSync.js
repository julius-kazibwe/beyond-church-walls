/**
 * Auto-sync utility to sync file system data to MongoDB when reconnected
 * This runs automatically when MongoDB reconnects after being unavailable
 */

const { getConnectionStatus } = require('./db');
const { exec } = require('child_process');
const path = require('path');

let syncInProgress = false;
let lastSyncAttempt = null;
const SYNC_COOLDOWN = 60000; // Don't sync more than once per minute

const runSync = () => {
  // Prevent multiple simultaneous syncs
  if (syncInProgress) {
    return;
  }

  // Cooldown check
  const now = Date.now();
  if (lastSyncAttempt && (now - lastSyncAttempt) < SYNC_COOLDOWN) {
    return;
  }

  syncInProgress = true;
  lastSyncAttempt = now;

  const syncScript = path.join(__dirname, '..', 'sync-files-to-mongodb.js');
  
  console.log('🔄 MongoDB reconnected. Starting automatic sync...');
  
  exec(`node ${syncScript}`, (error, stdout, stderr) => {
    syncInProgress = false;
    
    if (error) {
      console.error('⚠️  Auto-sync failed:', error.message);
      return;
    }
    
    if (stderr) {
      console.error('⚠️  Auto-sync warnings:', stderr);
    }
    
    if (stdout) {
      console.log(stdout);
    }
    
    console.log('✅ Auto-sync completed');
  });
};

// Check connection status periodically and sync when reconnected
let wasConnected = false;
let checkInterval = null;

const startAutoSync = () => {
  if (checkInterval) {
    return; // Already running
  }

  checkInterval = setInterval(() => {
    const isConnected = getConnectionStatus();
    
    // If we just reconnected (was disconnected, now connected)
    if (!wasConnected && isConnected) {
      console.log('🔄 MongoDB connection restored');
      runSync();
    }
    
    wasConnected = isConnected;
  }, 5000); // Check every 5 seconds
};

const stopAutoSync = () => {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
};

module.exports = {
  startAutoSync,
  stopAutoSync,
  runSync,
};

