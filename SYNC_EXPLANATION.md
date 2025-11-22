# File System to MongoDB Sync Explanation

## How It Works

The application uses a **hybrid storage system** with automatic synchronization:

### 1. **Primary Storage: MongoDB Atlas**
- When MongoDB is connected, all data operations go directly to MongoDB
- This is the preferred and production-ready storage method

### 2. **Fallback Storage: File System**
- If MongoDB connection fails, the app automatically falls back to file-based storage
- Data continues to be saved to JSON files in `server/data/`
- The app continues to function normally

### 3. **Automatic Sync When Reconnected**
- When MongoDB reconnects, the system automatically detects the reconnection
- A sync process runs to merge any file system data back into MongoDB
- The sync is **smart** - it only adds missing items, won't overwrite existing data

## Sync Process

### Automatic Sync (Recommended)
The system automatically syncs when MongoDB reconnects:
- Detects reconnection via MongoDB connection events
- Waits 2 seconds for connection to stabilize
- Runs sync process in background
- Logs sync results

### Manual Sync
If you need to manually trigger a sync:

```bash
cd server
node sync-files-to-mongodb.js
```

## What Gets Synced

The sync process merges:
- ✅ **Users** - New user accounts and their progress
- ✅ **Admins** - Admin accounts
- ✅ **Submissions** - Email signups, pre-orders, book previews
- ✅ **Feedback** - User feedback submissions
- ✅ **Endorsements** - Pastoral endorsements
- ✅ **Weekly Content** - Weekly study materials
- ✅ **Site Settings** - Launch date and other settings

## Sync Behavior

### Smart Merging
- **Won't overwrite**: Existing MongoDB data is never overwritten
- **Adds missing**: Only items that don't exist in MongoDB are added
- **Idempotent**: Safe to run multiple times

### Conflict Resolution
- If the same item exists in both systems:
  - MongoDB version is kept (considered source of truth)
  - File system version is skipped
- This prevents data duplication

## Example Scenario

1. **MongoDB is connected** → All data goes to MongoDB ✅
2. **MongoDB connection fails** → App switches to file system automatically 📁
3. **New data comes in** → Saved to file system (e.g., new user signups) 📝
4. **MongoDB reconnects** → Auto-sync runs automatically 🔄
5. **File system data merged** → New items added to MongoDB ✅
6. **Back to normal** → All operations use MongoDB again ✅

## Monitoring

The sync process logs:
- Number of items synced
- Number of items skipped (already exist)
- Any errors encountered

Check server logs to see sync activity:
```
🔄 MongoDB reconnected
🔄 Connection restored - syncing file system data...
📦 Syncing users...
  ✅ Synced 2 users, skipped 1 existing
📦 Syncing submissions...
  ✅ Synced 5 submissions, skipped 0 existing
✅ Auto-sync completed
```

## Best Practices

1. **Keep MongoDB connected** - This is the primary storage method
2. **Monitor connection status** - Check logs for connection issues
3. **Run manual sync if needed** - After extended downtime, you can manually trigger sync
4. **File system is backup** - The JSON files serve as a backup during outages

## Troubleshooting

### Sync not running automatically?
- Check MongoDB connection status
- Verify connection events are firing
- Check server logs for errors

### Data missing after sync?
- Check sync logs to see what was skipped
- Verify file system data exists
- Run manual sync to see detailed output

### Duplicate data?
- Sync is designed to prevent duplicates
- If duplicates exist, they were likely created before sync was implemented
- You may need to manually clean up duplicates

## Technical Details

- **Sync script**: `server/sync-files-to-mongodb.js`
- **Auto-sync utility**: `server/utils/autoSync.js`
- **Connection monitoring**: `server/utils/db.js`
- **Sync cooldown**: 60 seconds (prevents multiple simultaneous syncs)

