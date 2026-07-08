/**
 * Sync script to merge file system data back to MongoDB
 * Run this when MongoDB reconnects after being unavailable
 * 
 * This will:
 * 1. Read all data from file system
 * 2. Compare with MongoDB
 * 3. Add any missing items (won't overwrite existing data)
 * 
 * Usage: node sync-files-to-mongodb.js
 */

require('dotenv').config();
const { connectDB, getConnectionStatus } = require('./utils/db');
const fs = require('fs').promises;
const path = require('path');

// Import models
const User = require('./models/User');
const Admin = require('./models/Admin');
const Submission = require('./models/Submission');
const Feedback = require('./models/Feedback');
const Endorsement = require('./models/Endorsement');
const GrowthVideo = require('./models/GrowthVideo');
const WeeklyContent = require('./models/WeeklyContent');
const SiteSettings = require('./models/SiteSettings');

// Import file-based storage utilities
const userStorage = require('./utils/userStorage');
const adminStorage = require('./utils/adminStorage');
const feedbackStorage = require('./utils/feedbackStorage');
const endorsementStorage = require('./utils/endorsementStorage');
const growthVideoStorage = require('./utils/growthVideoStorage');
const weeklyContentStorage = require('./utils/weeklyContentStorage');
const siteSettingsStorage = require('./utils/siteSettingsStorage');

const dataDir = path.join(__dirname, 'data');

async function syncUsers() {
  console.log('📦 Syncing users...');
  try {
    const indexFile = path.join(dataDir, 'users', 'index.json');
    let index = { users: [] };
    try {
      const indexData = await fs.readFile(indexFile, 'utf8');
      index = JSON.parse(indexData);
    } catch (e) {
      console.log('  ⏭️  No users index found');
      return { synced: 0, skipped: 0 };
    }

    let synced = 0;
    let skipped = 0;

    for (const userEntry of index.users) {
      try {
        const filename = userEntry.file || `${userEntry.id}.json`;
        const userFile = path.join(dataDir, 'users', filename);
        const userData = JSON.parse(await fs.readFile(userFile, 'utf8'));

        // Check if user exists in MongoDB
        const existing = await User.findOne({ email: userData.email });
        if (existing) {
          skipped++;
          continue;
        }

        // Create user in MongoDB
        await User.create({
          email: userData.email,
          passwordHash: userData.passwordHash || userData.password,
          name: userData.name || '',
          createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date(),
          lastLogin: userData.lastLogin ? new Date(userData.lastLogin) : null,
          progress: {
            baselineFRIQ: userData.progress?.baselineFRIQ || null,
            weeklyAssessments: userData.progress?.assessments || {},
            assessmentHistory: userData.progress?.assessmentHistory || [],
            reflections: userData.progress?.reflections || {},
            practicalApplications: userData.progress?.practicalApplications || {},
          },
        });
        synced++;
      } catch (error) {
        console.error(`  ❌ Error syncing user ${userEntry.id || 'unknown'}:`, error.message);
      }
    }
    console.log(`  ✅ Synced ${synced} users, skipped ${skipped} existing`);
    return { synced, skipped };
  } catch (error) {
    console.error('  ❌ Error syncing users:', error.message);
    return { synced: 0, skipped: 0 };
  }
}

async function syncAdmins() {
  console.log('📦 Syncing admins...');
  try {
    const admins = await adminStorage.getAllAdmins();
    let synced = 0;
    let skipped = 0;

    for (const admin of admins) {
      try {
        const existing = await Admin.findOne({ email: admin.email });
        if (existing) {
          skipped++;
          continue;
        }

        await Admin.create({
          email: admin.email,
          passwordHash: admin.passwordHash || admin.password,
          name: admin.name || 'Admin',
          createdAt: admin.createdAt ? new Date(admin.createdAt) : new Date(),
          lastLogin: admin.lastLogin ? new Date(admin.lastLogin) : null,
        });
        synced++;
      } catch (error) {
        console.error(`  ❌ Error syncing admin ${admin.email}:`, error.message);
      }
    }
    console.log(`  ✅ Synced ${synced} admins, skipped ${skipped} existing`);
    return { synced, skipped };
  } catch (error) {
    console.error('  ❌ Error syncing admins:', error.message);
    return { synced: 0, skipped: 0 };
  }
}

async function syncSubmissions() {
  console.log('📦 Syncing submissions...');
  try {
    const files = await fs.readdir(dataDir);
    const submissionFiles = files.filter(f =>
      (f.startsWith('email-signup-') || f.startsWith('pre-order-') || f.startsWith('book-preview-')) &&
      f.endsWith('.json')
    );

    let synced = 0;
    let skipped = 0;

    for (const file of submissionFiles) {
      try {
        const content = await fs.readFile(path.join(dataDir, file), 'utf8');
        const submission = JSON.parse(content);

        // Check if exists (by type, timestamp, and data)
        const existing = await Submission.findOne({
          type: submission.type,
          timestamp: new Date(submission.timestamp),
          'data.email': submission.data?.email,
        });
        if (existing) {
          skipped++;
          continue;
        }

        await Submission.create({
          type: submission.type,
          data: submission.data,
          timestamp: new Date(submission.timestamp),
        });
        synced++;
      } catch (error) {
        console.error(`  ❌ Error syncing ${file}:`, error.message);
      }
    }
    console.log(`  ✅ Synced ${synced} submissions, skipped ${skipped} existing`);
    return { synced, skipped };
  } catch (error) {
    console.error('  ❌ Error syncing submissions:', error.message);
    return { synced: 0, skipped: 0 };
  }
}

async function syncFeedback() {
  console.log('📦 Syncing feedback...');
  try {
    const feedback = await feedbackStorage.getAllFeedback();
    let synced = 0;
    let skipped = 0;

    for (const item of feedback) {
      try {
        const message = item.message || item.quote || '';
        const email = item.email || `${item.name?.toLowerCase().replace(/\s+/g, '.')}@feedback.local` || 'anonymous@feedback.local';

        if (!message) continue;

        const existing = await Feedback.findOne({
          name: item.name,
          message: message,
        });
        if (existing) {
          skipped++;
          continue;
        }

        await Feedback.create({
          name: item.name || 'Anonymous',
          email: email,
          title: item.title || '',
          message: message,
          approved: item.approved !== undefined ? item.approved : false,
          createdAt: item.submittedAt ? new Date(item.submittedAt) : (item.createdAt ? new Date(item.createdAt) : new Date()),
          updatedAt: item.approvedAt ? new Date(item.approvedAt) : (item.updatedAt ? new Date(item.updatedAt) : new Date()),
        });
        synced++;
      } catch (error) {
        console.error(`  ❌ Error syncing feedback:`, error.message);
      }
    }
    console.log(`  ✅ Synced ${synced} feedback items, skipped ${skipped} existing`);
    return { synced, skipped };
  } catch (error) {
    console.error('  ❌ Error syncing feedback:', error.message);
    return { synced: 0, skipped: 0 };
  }
}

async function syncEndorsements() {
  console.log('📦 Syncing endorsements...');
  try {
    const endorsements = await endorsementStorage.getAllEndorsements();
    let synced = 0;
    let skipped = 0;

    for (const item of endorsements) {
      try {
        const existing = await Endorsement.findOne({
          name: item.name,
          quote: item.quote,
        });
        if (existing) {
          skipped++;
          continue;
        }

        await Endorsement.create({
          name: item.name,
          title: item.title,
          quote: item.quote,
          type: item.type || 'pastoral',
          approved: item.approved !== undefined ? item.approved : false,
          createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
          updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
        });
        synced++;
      } catch (error) {
        console.error(`  ❌ Error syncing endorsement:`, error.message);
      }
    }
    console.log(`  ✅ Synced ${synced} endorsements, skipped ${skipped} existing`);
    return { synced, skipped };
  } catch (error) {
    console.error('  ❌ Error syncing endorsements:', error.message);
    return { synced: 0, skipped: 0 };
  }
}

async function syncGrowthVideos() {
  console.log('📦 Syncing growth videos...');
  try {
    const videos = await growthVideoStorage.getAllGrowthVideos();
    let synced = 0;
    let skipped = 0;

    for (const item of videos) {
      try {
        const existing = await GrowthVideo.findOne({ youtubeId: item.youtubeId });
        if (existing) {
          skipped++;
          continue;
        }

        await GrowthVideo.create({
          youtubeId: item.youtubeId,
          title: item.title,
          category: item.category || 'general',
          categoryLabel: item.categoryLabel || '',
          url: item.url,
          thumbnail: item.thumbnail || '',
          thumbnailFallback: item.thumbnailFallback || '',
          featured: item.featured === true,
          sortOrder: item.sortOrder || 0,
          published: item.published !== false,
          createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
          updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
        });
        synced++;
      } catch (error) {
        console.error(`  ❌ Error syncing growth video:`, error.message);
      }
    }
    console.log(`  ✅ Synced ${synced} growth videos, skipped ${skipped} existing`);
    return { synced, skipped };
  } catch (error) {
    console.error('  ❌ Error syncing growth videos:', error.message);
    return { synced: 0, skipped: 0 };
  }
}

async function syncWeeklyContent() {
  console.log('📦 Syncing weekly content...');
  try {
    const content = await weeklyContentStorage.getAllWeeklyContent();
    let synced = 0;
    let skipped = 0;

    for (const [weekNum, weekData] of Object.entries(content)) {
      try {
        const existing = await WeeklyContent.findOne({ weekNumber: parseInt(weekNum) });
        if (existing) {
          skipped++;
          continue;
        }

        let completionMessage = '';
        if (weekData.completionMessage) {
          if (typeof weekData.completionMessage === 'string') {
            completionMessage = weekData.completionMessage;
          } else if (typeof weekData.completionMessage === 'object') {
            completionMessage = weekData.completionMessage.message || weekData.completionMessage.title || '';
          }
        }

        await WeeklyContent.create({
          weekNumber: parseInt(weekNum),
          title: weekData.title,
          keyScripture: weekData.keyScripture,
          keyScriptureText: weekData.keyScriptureText || '',
          completionMessage: completionMessage,
        });
        synced++;
      } catch (error) {
        console.error(`  ❌ Error syncing week ${weekNum}:`, error.message);
      }
    }
    console.log(`  ✅ Synced ${synced} weeks, skipped ${skipped} existing`);
    return { synced, skipped };
  } catch (error) {
    console.error('  ❌ Error syncing weekly content:', error.message);
    return { synced: 0, skipped: 0 };
  }
}

async function syncSiteSettings() {
  console.log('📦 Syncing site settings...');
  try {
    const settings = await siteSettingsStorage.getSiteSettings();
    const existing = await SiteSettings.findOne();
    
    if (existing) {
      console.log('  ⏭️  Site settings already exist, skipping');
      return { synced: 0, skipped: 1 };
    }

    await SiteSettings.create({
      launchDate: settings.launchDate || 'Mid-December',
      launchDateFormatted: settings.launchDateFormatted ? new Date(settings.launchDateFormatted) : null,
      updatedAt: settings.updatedAt ? new Date(settings.updatedAt) : new Date(),
    });
    console.log('  ✅ Synced site settings');
    return { synced: 1, skipped: 0 };
  } catch (error) {
    console.error('  ❌ Error syncing site settings:', error.message);
    return { synced: 0, skipped: 0 };
  }
}

async function main() {
  console.log('🔄 Starting file system to MongoDB sync...\n');

  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not set in environment variables');
    console.error('   Please set MONGODB_URI in your .env file');
    process.exit(1);
  }

  await connectDB();

  if (!getConnectionStatus()) {
    console.error('❌ Failed to connect to MongoDB');
    console.error('   Please check your MONGODB_URI connection string');
    process.exit(1);
  }

  console.log('✅ Connected to MongoDB\n');

  const results = {
    users: await syncUsers(),
    admins: await syncAdmins(),
    submissions: await syncSubmissions(),
    feedback: await syncFeedback(),
    endorsements: await syncEndorsements(),
    growthVideos: await syncGrowthVideos(),
    weeklyContent: await syncWeeklyContent(),
    siteSettings: await syncSiteSettings(),
  };

  console.log('\n📊 Sync Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  let totalSynced = 0;
  let totalSkipped = 0;

  for (const [type, result] of Object.entries(results)) {
    const typeName = type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`${typeName.padEnd(20)}: ${result.synced} synced, ${result.skipped} skipped`);
    totalSynced += result.synced;
    totalSkipped += result.skipped;
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Total: ${totalSynced} items synced, ${totalSkipped} items skipped (already exist)`);
  console.log('\n✅ Sync completed!');

  process.exit(0);
}

main().catch(error => {
  console.error('❌ Sync failed:', error);
  process.exit(1);
});

