# Deployment Guide for Render

This guide will help you deploy the Beyond Church Walls backend API to Render with MongoDB Atlas.

## Prerequisites

1. **MongoDB Atlas Account**
   - Sign up at https://www.mongodb.com/cloud/atlas
   - Create a free cluster (M0)
   - Create a database user
   - Get your connection string

2. **Render Account**
   - Sign up at https://render.com

## Step 1: Set Up MongoDB Atlas

1. Log in to MongoDB Atlas
2. Create a new cluster (free tier is fine)
3. Go to "Database Access" and create a database user
4. Go to "Network Access" and add your IP address (or 0.0.0.0/0 for all IPs)
5. Click "Connect" on your cluster
6. Choose "Connect your application"
7. Copy the connection string (it will look like: `mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority`)
8. Replace `<password>` with your actual password
9. Replace `<dbname>` with your database name (e.g., `beyondchurchwalls`)

## Step 2: Deploy to Render

### Option A: Using render.yaml (Recommended)

1. Push your code to GitHub
2. In Render dashboard, click "New" → "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect `render.yaml` and configure the service
5. Add environment variables in Render dashboard (see below)

### Option B: Manual Setup

1. In Render dashboard, click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `beyond-church-walls-api`
   - **Environment**: `Node`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Root Directory**: Leave empty (or set to repository root)

## Step 3: Environment Variables

Add these environment variables in Render dashboard (Settings → Environment):

### Required:
- `MONGODB_URI` - Your MongoDB Atlas connection string
- `JWT_SECRET` - A random secret string for JWT tokens (generate with: `openssl rand -base64 32`)
- `ADMIN_JWT_SECRET` - A random secret string for admin JWT tokens (generate with: `openssl rand -base64 32`)

### Optional (with defaults):
- `PORT` - Port number (default: 10000, Render sets this automatically)
- `JWT_EXPIRES_IN` - JWT expiration (default: 7d)
- `ADMIN_JWT_EXPIRES_IN` - Admin JWT expiration (default: 24h)

### Email Configuration (Optional):
- `EMAIL_SERVICE` - `gmail` or `smtp`
- `EMAIL_USER` - Your email address
- `EMAIL_PASSWORD` - Your email password or app password
- `EMAIL_FROM` - Email address to send from
- `ADMIN_EMAIL` - Email address to receive admin notifications

## Step 4: Run Migration

After deployment, you need to migrate existing data from file-based storage to MongoDB:

1. SSH into your Render service (or use Render Shell)
2. Run the migration script:
   ```bash
   cd server
   node migrate-to-mongodb.js
   ```

Or, if you have local data to migrate:
1. Make sure your local `.env` has `MONGODB_URI` set
2. Run locally: `cd server && node migrate-to-mongodb.js`

## Step 5: Update Frontend API URL

Update your frontend to point to the Render API URL:

1. In your frontend `.env` or `vite.config.js`, set:
   ```
   VITE_API_URL=https://your-render-service.onrender.com/api
   ```

Or update `src/config/api.js` to use the Render URL in production.

## Troubleshooting

### MongoDB Connection Issues
- Check that your IP is whitelisted in MongoDB Atlas
- Verify the connection string is correct
- Check that the database user has proper permissions

### Build Failures
- Ensure `package.json` has all dependencies
- Check that Node.js version is compatible (Render uses Node 18+ by default)

### Runtime Errors
- Check Render logs for error messages
- Verify all environment variables are set
- Ensure MongoDB connection is working

## Health Check

After deployment, test the health endpoint:
```
https://your-render-service.onrender.com/api/health
```

You should see:
```json
{
  "status": "ok",
  "timestamp": "..."
}
```

## Notes

- The app will automatically fall back to file-based storage if MongoDB is not connected
- For production, always use MongoDB Atlas
- Keep your environment variables secure and never commit them to Git
- Use Render's environment variable sync feature for sensitive values

