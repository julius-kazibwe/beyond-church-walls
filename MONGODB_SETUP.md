# MongoDB Atlas Setup & Integration

## Quick Start

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Set up MongoDB Atlas:**
   - Create account at https://www.mongodb.com/cloud/atlas
   - Create a free cluster (M0)
   - Create database user
   - Whitelist IP (0.0.0.0/0 for all IPs, or your specific IP)
   - Get connection string

3. **Update `.env` file:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
   ```

4. **Run migration (if you have existing data):**
   ```bash
   cd server
   node migrate-to-mongodb.js
   ```

5. **Start server:**
   ```bash
   npm start
   ```

## How It Works

The application uses a **hybrid approach**:
- **Primary**: MongoDB Atlas (when `MONGODB_URI` is set and connection succeeds)
- **Fallback**: File-based storage (when MongoDB is not available)

This means:
- ✅ Works immediately with file-based storage (no MongoDB required for development)
- ✅ Automatically uses MongoDB when connection string is provided
- ✅ Seamless transition - no code changes needed

## Data Models

All data is stored in MongoDB collections:

- **users** - User accounts and progress
- **admins** - Admin accounts
- **submissions** - Email signups, pre-orders, book previews
- **feedbacks** - User feedback submissions
- **endorsements** - Pastoral endorsements
- **weeklycontents** - Weekly study content
- **sitesettings** - Site configuration

## Migration

The migration script (`server/migrate-to-mongodb.js`) will:
- ✅ Migrate all users with their progress
- ✅ Migrate all admin accounts
- ✅ Migrate all submissions (email signups, pre-orders, book previews)
- ✅ Migrate all feedback
- ✅ Migrate all endorsements
- ✅ Migrate weekly study content
- ✅ Migrate site settings

**Note**: The script is idempotent - you can run it multiple times safely. It will skip items that already exist.

## Environment Variables

Required for MongoDB:
- `MONGODB_URI` - Your MongoDB Atlas connection string

Optional (with defaults):
- `PORT` - Server port (default: 3001)
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRES_IN` - JWT expiration (default: 7d)
- `ADMIN_JWT_SECRET` - Admin JWT signing secret
- `ADMIN_JWT_EXPIRES_IN` - Admin JWT expiration (default: 24h)

## Deployment to Render

See `server/DEPLOYMENT.md` for detailed Render deployment instructions.

## Troubleshooting

### Connection Issues
- Verify `MONGODB_URI` is correct
- Check IP whitelist in MongoDB Atlas
- Ensure database user has proper permissions
- Check network connectivity

### Migration Issues
- Ensure MongoDB connection is working before running migration
- Check that file-based data exists in `server/data/`
- Review migration logs for specific errors

### Fallback Behavior
If MongoDB connection fails, the app will:
- Log a warning
- Continue using file-based storage
- Work normally (but without MongoDB benefits)

This ensures the app never breaks due to database issues.

