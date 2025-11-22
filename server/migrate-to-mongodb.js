/**
 * Migration script to move data from file-based storage to MongoDB
 * Run this once after setting up MongoDB Atlas connection
 * 
 * Usage: node migrate-to-mongodb.js
 */

require('dotenv').config();
const { connectDB, getConnectionStatus } = require('./utils/db');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');

// Import models
const User = require('./models/User');
const Admin = require('./models/Admin');
const Submission = require('./models/Submission');
const Feedback = require('./models/Feedback');
const Endorsement = require('./models/Endorsement');
const WeeklyContent = require('./models/WeeklyContent');
const SiteSettings = require('./models/SiteSettings');

// Import file-based storage utilities
const userStorage = require('./utils/userStorage');
const adminStorage = require('./utils/adminStorage');
const feedbackStorage = require('./utils/feedbackStorage');
const endorsementStorage = require('./utils/endorsementStorage');
const weeklyContentStorage = require('./utils/weeklyContentStorage');
const siteSettingsStorage = require('./utils/siteSettingsStorage');

const dataDir = path.join(__dirname, 'data');

async function migrateUsers() {
  console.log('📦 Migrating users...');
  try {
    const indexFile = path.join(dataDir, 'users', 'index.json');
    let index = { users: [] };
    try {
      const indexData = await fs.readFile(indexFile, 'utf8');
      index = JSON.parse(indexData);
    } catch (e) {
      console.log('  No users index found, skipping users migration');
      return;
    }

    let migrated = 0;
    for (const userEntry of index.users) {
      try {
        // Construct filename from id if file field doesn't exist
        const filename = userEntry.file || `${userEntry.id}.json`;
        const userFile = path.join(dataDir, 'users', filename);
        const userData = JSON.parse(await fs.readFile(userFile, 'utf8'));
        
        // Check if user already exists
        const existing = await User.findOne({ email: userData.email });
        if (existing) {
          console.log(`  ⏭️  User ${userData.email} already exists, skipping`);
          continue;
        }

        // Map progress structure to match MongoDB schema
        const progress = userData.progress || {};
        const mappedProgress = {
          baselineFRIQ: progress.baselineFRIQ || null,
          weeklyAssessments: progress.assessments || {},
          reflections: progress.reflections || {},
          practicalApplications: progress.practicalApplications || {},
        };

        await User.create({
          email: userData.email,
          passwordHash: userData.passwordHash || userData.password, // Handle both field names
          name: userData.name || '',
          createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date(),
          lastLogin: userData.lastLogin ? new Date(userData.lastLogin) : null,
          progress: mappedProgress,
        });
        migrated++;
      } catch (error) {
        console.error(`  ❌ Error migrating user ${userEntry.id || userEntry.file || 'unknown'}:`, error.message);
      }
    }
    console.log(`  ✅ Migrated ${migrated} users`);
  } catch (error) {
    console.error('  ❌ Error migrating users:', error.message);
  }
}

async function migrateAdmins() {
  console.log('📦 Migrating admins...');
  try {
    const admins = await adminStorage.getAllAdmins();
    let migrated = 0;
    for (const admin of admins) {
      try {
        const existing = await Admin.findOne({ email: admin.email });
        if (existing) {
          console.log(`  ⏭️  Admin ${admin.email} already exists, skipping`);
          continue;
        }

        await Admin.create({
          email: admin.email,
          passwordHash: admin.passwordHash || admin.password, // Handle both field names
          name: admin.name || 'Admin',
          createdAt: admin.createdAt ? new Date(admin.createdAt) : new Date(),
          lastLogin: admin.lastLogin ? new Date(admin.lastLogin) : null,
        });
        migrated++;
      } catch (error) {
        console.error(`  ❌ Error migrating admin ${admin.email}:`, error.message);
      }
    }
    console.log(`  ✅ Migrated ${migrated} admins`);
  } catch (error) {
    console.error('  ❌ Error migrating admins:', error.message);
  }
}

async function migrateSubmissions() {
  console.log('📦 Migrating submissions...');
  try {
    const files = await fs.readdir(dataDir);
    const submissionFiles = files.filter(f => 
      (f.startsWith('email-signup-') || f.startsWith('pre-order-') || f.startsWith('book-preview-')) &&
      f.endsWith('.json')
    );

    let migrated = 0;
    for (const file of submissionFiles) {
      try {
        const content = await fs.readFile(path.join(dataDir, file), 'utf8');
        const submission = JSON.parse(content);
        
        // Check if already exists (by timestamp and type)
        const existing = await Submission.findOne({
          type: submission.type,
          timestamp: new Date(submission.timestamp),
        });
        if (existing) {
          continue;
        }

        await Submission.create({
          type: submission.type,
          data: submission.data,
          timestamp: new Date(submission.timestamp),
        });
        migrated++;
      } catch (error) {
        console.error(`  ❌ Error migrating ${file}:`, error.message);
      }
    }
    console.log(`  ✅ Migrated ${migrated} submissions`);
  } catch (error) {
    console.error('  ❌ Error migrating submissions:', error.message);
  }
}

async function migrateFeedback() {
  console.log('📦 Migrating feedback...');
  try {
    const feedback = await feedbackStorage.getAllFeedback();
    let migrated = 0;
    let convertedToEndorsements = 0;
    
    for (const item of feedback) {
      try {
        // Handle items with quote but no message - use quote as message
        const message = item.message || item.quote || '';
        // Generate email if missing
        const email = item.email || `${item.name?.toLowerCase().replace(/\s+/g, '.')}@feedback.local` || 'anonymous@feedback.local';

        // Skip if we still don't have a message/quote
        if (!message) {
          console.log(`  ⏭️  Skipping feedback item (no message or quote): ${item.name || 'unknown'}`);
          continue;
        }

        const existing = await Feedback.findOne({
          name: item.name,
          message: message,
        });
        if (existing) {
          continue;
        }

        await Feedback.create({
          name: item.name || 'Anonymous',
          email: email,
          title: item.title || '',
          message: message,
          approved: item.approved !== undefined ? item.approved : (item.approvedAt ? true : false),
          createdAt: item.submittedAt ? new Date(item.submittedAt) : (item.createdAt ? new Date(item.createdAt) : new Date()),
          updatedAt: item.approvedAt ? new Date(item.approvedAt) : (item.updatedAt ? new Date(item.updatedAt) : new Date()),
        });
        migrated++;
      } catch (error) {
        console.error(`  ❌ Error migrating feedback (${item.name || 'unknown'}):`, error.message);
      }
    }
    console.log(`  ✅ Migrated ${migrated} feedback items`);
  } catch (error) {
    console.error('  ❌ Error migrating feedback:', error.message);
  }
}

async function migrateEndorsements() {
  console.log('📦 Migrating endorsements...');
  try {
    const endorsements = await endorsementStorage.getAllEndorsements();
    let migrated = 0;
    for (const item of endorsements) {
      try {
        const existing = await Endorsement.findOne({
          name: item.name,
          quote: item.quote,
        });
        if (existing) {
          continue;
        }

        await Endorsement.create({
          name: item.name,
          title: item.title,
          quote: item.quote,
          type: item.type || 'pastoral',
          approved: item.approved || false,
          createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
          updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
        });
        migrated++;
      } catch (error) {
        console.error(`  ❌ Error migrating endorsement:`, error.message);
      }
    }
    console.log(`  ✅ Migrated ${migrated} endorsements`);
  } catch (error) {
    console.error('  ❌ Error migrating endorsements:', error.message);
  }
}

async function migrateWeeklyContent() {
  console.log('📦 Migrating weekly content...');
  try {
    const content = await weeklyContentStorage.getAllWeeklyContent();
    let migrated = 0;
    for (const [weekNum, weekData] of Object.entries(content)) {
      try {
        const existing = await WeeklyContent.findOne({ weekNumber: parseInt(weekNum) });
        if (existing) {
          console.log(`  ⏭️  Week ${weekNum} already exists, skipping`);
          continue;
        }

        // Handle completionMessage - it might be an object or a string
        let completionMessage = '';
        if (weekData.completionMessage) {
          if (typeof weekData.completionMessage === 'string') {
            completionMessage = weekData.completionMessage;
          } else if (typeof weekData.completionMessage === 'object') {
            // If it's an object, extract the message
            completionMessage = weekData.completionMessage.message || weekData.completionMessage.title || '';
          }
        }

        await WeeklyContent.create({
          weekNumber: parseInt(weekNum),
          title: weekData.title,
          keyScripture: weekData.keyScripture,
          keyScriptureText: weekData.keyScriptureText || '',
          completionMessage: completionMessage,
          questions: weekData.questions || {},
        });
        migrated++;
      } catch (error) {
        console.error(`  ❌ Error migrating week ${weekNum}:`, error.message);
      }
    }
    console.log(`  ✅ Migrated ${migrated} weeks`);
  } catch (error) {
    console.error('  ❌ Error migrating weekly content:', error.message);
  }
}

async function migrateSiteSettings() {
  console.log('📦 Migrating site settings...');
  try {
    const settings = await siteSettingsStorage.getSiteSettings();
    const existing = await SiteSettings.findOne();
    if (existing) {
      console.log('  ⏭️  Site settings already exist, skipping');
      return;
    }

    await SiteSettings.create({
      launchDate: settings.launchDate || 'Mid-December',
      launchDateFormatted: settings.launchDateFormatted ? new Date(settings.launchDateFormatted) : null,
      updatedAt: settings.updatedAt ? new Date(settings.updatedAt) : new Date(),
    });
    console.log('  ✅ Migrated site settings');
  } catch (error) {
    console.error('  ❌ Error migrating site settings:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting MongoDB migration...\n');

  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not set in environment variables');
    console.error('   Please set MONGODB_URI in your .env file');
    process.exit(1);
  }

  await connectDB();

  if (!getConnectionStatus()) {
    console.error('❌ Failed to connect to MongoDB');
    process.exit(1);
  }

  console.log('✅ Connected to MongoDB\n');

  await migrateUsers();
  await migrateAdmins();
  await migrateSubmissions();
  await migrateFeedback();
  await migrateEndorsements();
  await migrateWeeklyContent();
  await migrateSiteSettings();

  console.log('\n✅ Migration completed!');
  process.exit(0);
}

main().catch(error => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});

