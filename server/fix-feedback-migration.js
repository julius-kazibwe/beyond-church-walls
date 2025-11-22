/**
 * Fix script to convert endorsements back to feedback
 * This will delete the 4 endorsements that were incorrectly converted from feedback
 * and create them as feedback entries instead
 */

require('dotenv').config();
const { connectDB, getConnectionStatus } = require('./utils/db');
const Feedback = require('./models/Feedback');
const Endorsement = require('./models/Endorsement');

const feedbackItemsToRestore = [
  {
    name: "His Worship Elias Kakooza",
    title: "Chief Magistrate, Nakawa Chief Magistrate's Court – Uganda",
    quote: "Beyond Church Walls is timely and transformational, restoring the believer's understanding of calling and showing that ministry extends to every sphere of life.",
    email: "",
    submittedAt: "2024-01-01T00:00:00.000Z",
    approved: true,
    approvedAt: "2025-11-21T23:23:34.206Z"
  },
  {
    name: "Dr. Olivia Kasirye",
    title: "Public Health Physician & Ministry Partner – Sacramento, California",
    quote: "This book restores the sacred connection between faith and daily work, calling believers to live with integrity, compassion, and excellence wherever God has placed them.",
    email: "",
    submittedAt: "2024-01-02T00:00:00.000Z",
    approved: true,
    approvedAt: "2025-11-21T23:23:47.008Z"
  },
  {
    name: "Elizabeth Baleke",
    title: "Global Outreach International",
    quote: "In a generation searching for identity and purpose, Beyond Church Walls shines as a beacon of truth and hope—guiding readers to live with significance in God's service.",
    email: "",
    submittedAt: "2024-01-03T00:00:00.000Z",
    approved: true,
    approvedAt: "2025-11-21T23:23:47.969Z"
  },
  {
    name: "Mr. Samuel Turyahikayo",
    title: "National Director, Scripture Union Uganda",
    quote: "A timely call to bridge faith and daily work, Beyond Church Walls equips believers to see work as sacred service and live with purpose, faith, and excellence.",
    email: "",
    submittedAt: "2024-01-04T00:00:00.000Z",
    approved: true,
    approvedAt: "2024-01-04T00:00:00.000Z"
  }
];

async function fixFeedbackMigration() {
  console.log('🔧 Fixing feedback migration...\n');

  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not set in environment variables');
    process.exit(1);
  }

  await connectDB();

  if (!getConnectionStatus()) {
    console.error('❌ Failed to connect to MongoDB');
    process.exit(1);
  }

  console.log('✅ Connected to MongoDB\n');

  let deleted = 0;
  let created = 0;

  for (const item of feedbackItemsToRestore) {
    try {
      // Delete the endorsement if it exists
      const deletedEndorsement = await Endorsement.findOneAndDelete({
        name: item.name,
        quote: item.quote,
      });

      if (deletedEndorsement) {
        console.log(`  🗑️  Deleted endorsement: ${item.name}`);
        deleted++;
      }

      // Check if feedback already exists
      const existingFeedback = await Feedback.findOne({
        name: item.name,
        message: item.quote,
      });

      if (existingFeedback) {
        console.log(`  ⏭️  Feedback already exists: ${item.name}`);
        continue;
      }

      // Create as feedback (use quote as message, generate email if empty)
      const email = item.email || `${item.name.toLowerCase().replace(/\s+/g, '.')}@feedback.local`;

      await Feedback.create({
        name: item.name,
        email: email,
        title: item.title || '',
        message: item.quote, // Use quote as message
        approved: item.approved !== undefined ? item.approved : true,
        createdAt: item.submittedAt ? new Date(item.submittedAt) : new Date(),
        updatedAt: item.approvedAt ? new Date(item.approvedAt) : new Date(),
      });

      console.log(`  ✅ Created feedback: ${item.name}`);
      created++;
    } catch (error) {
      console.error(`  ❌ Error processing ${item.name}:`, error.message);
    }
  }

  console.log(`\n✅ Fix completed!`);
  console.log(`   - Deleted ${deleted} endorsements`);
  console.log(`   - Created ${created} feedback entries`);
  
  process.exit(0);
}

fixFeedbackMigration().catch(error => {
  console.error('❌ Fix failed:', error);
  process.exit(1);
});

