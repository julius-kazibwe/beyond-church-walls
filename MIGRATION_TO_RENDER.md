# Migration Guide: Vercel Serverless to Render

This guide will help you migrate your backend API from Vercel serverless functions to a dedicated Express server on Render, while keeping your frontend on Vercel.

## Overview

**Before:**
- Frontend: Vercel (React/Vite)
- Backend: Vercel Serverless Functions (`/api` directory)

**After:**
- Frontend: Vercel (React/Vite)
- Backend: Render (Express server in `/server` directory)

## Step-by-Step Migration

### Step 1: Deploy Server to Render

1. **Push your code to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Create a Render account** (if you don't have one)
   - Go to https://render.com
   - Sign up with GitHub

3. **Deploy using render.yaml (Recommended)**
   - In Render dashboard, click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml` and configure the service
   - Click "Apply"

4. **Or deploy manually:**
   - In Render dashboard, click "New" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `beyond-church-walls-api`
     - **Environment**: `Node`
     - **Build Command**: `cd server && npm install`
     - **Start Command**: `cd server && npm start`
     - **Root Directory**: Leave empty

### Step 2: Configure Environment Variables in Render

In Render dashboard, go to your service → Environment tab, and add:

**Required:**
- `NODE_ENV` = `production`
- `PORT` = `10000` (or leave Render's default)
- `MONGODB_URI` = Your MongoDB Atlas connection string
- `JWT_SECRET` = A random secret (generate with: `openssl rand -base64 32`)
- `ADMIN_JWT_SECRET` = A random secret (generate with: `openssl rand -base64 32`)
- `FRONTEND_URL` = `https://www.bcws.info` (your production frontend URL)

**Optional (for email functionality):**
- `JWT_EXPIRES_IN` = `7d`
- `ADMIN_JWT_EXPIRES_IN` = `24h`
- `EMAIL_SERVICE` = `gmail` (or `smtp`, `sendgrid`)
- `EMAIL_USER` = Your email address
- `EMAIL_PASSWORD` = Your email app password
- `EMAIL_FROM` = Your email address
- `ADMIN_EMAIL` = Admin notification email

### Step 3: Your Render Server URL

Your Render server URL is:
- **Backend API**: `https://beyond-church-walls.onrender.com`

You'll need this URL for the next step.

### Step 4: Update Vercel Frontend Configuration

1. **Go to your Vercel project dashboard**
2. **Navigate to Settings → Environment Variables**
3. **Add a new environment variable:**
   - **Key**: `VITE_API_URL`
   - **Value**: `https://beyond-church-walls.onrender.com`
   - **Environment**: Production, Preview, and Development (or just Production if you prefer)

4. **Redeploy your Vercel frontend** to pick up the new environment variable:
   - Go to Deployments tab
   - Click the three dots on the latest deployment
   - Click "Redeploy"

### Step 5: Verify the Migration

1. **Test the health endpoint:**
   - Visit: `https://beyond-church-walls.onrender.com/api/health`
   - Should return: `{"status":"ok","message":"Backend is running"}`

2. **Test from your frontend:**
   - Visit your Vercel site
   - Open browser DevTools → Network tab
   - Try using the app (login, signup, etc.)
   - Verify API calls are going to your Render server URL

3. **Check CORS:**
   - If you see CORS errors, verify:
     - `FRONTEND_URL` in Render matches your Vercel URL exactly
     - Your Vercel URL is in the allowed origins

### Step 6: (Optional) Clean Up Vercel Serverless Functions

Once you've verified everything works with Render:

1. **Backup the `/api` directory** (just in case):
   ```bash
   cp -r api api.backup
   ```

2. **Remove serverless functions from vercel.json:**
   - Edit `vercel.json` and remove the `functions` section:
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "devCommand": "npm run dev",
     "installCommand": "npm install",
     "framework": "vite",
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

3. **Optionally delete the `/api` directory** (after confirming everything works):
   ```bash
   rm -r api
   ```

## Troubleshooting

### CORS Errors

If you see CORS errors in the browser console:

1. **Check FRONTEND_URL in Render:**
   - Must match your Vercel URL exactly (including `https://`)
   - Example: `https://beyond-church-walls.vercel.app`

2. **Check Render logs:**
   - Go to Render dashboard → Your service → Logs
   - Look for CORS-related errors

3. **Temporary fix (development only):**
   - The server allows all origins in development mode
   - In production, it only allows configured origins

### API Calls Not Working

1. **Verify VITE_API_URL is set:**
   - Check Vercel environment variables
   - Redeploy after adding the variable

2. **Check browser console:**
   - Look for network errors
   - Verify API calls are going to Render URL, not `/api`

3. **Test Render server directly:**
   - Visit `https://beyond-church-walls.onrender.com/api/health`
   - Should work without authentication

### MongoDB Connection Issues

1. **Verify MONGODB_URI in Render:**
   - Check it's set correctly
   - Ensure MongoDB Atlas allows connections from Render's IPs (use `0.0.0.0/0` for all IPs)

2. **Check Render logs:**
   - Look for MongoDB connection errors
   - Server will fall back to file storage if MongoDB fails (in dev mode)

## Rollback Plan

If something goes wrong, you can quickly rollback:

1. **Remove VITE_API_URL from Vercel** environment variables
2. **Redeploy Vercel** (will use `/api` serverless functions again)
3. **Keep Render service running** (or pause it to save resources)

## Cost Considerations

- **Render Free Tier:**
  - Services spin down after 15 minutes of inactivity
  - First request after spin-down takes ~30 seconds (cold start)
  - Consider upgrading to paid plan for always-on service

- **Vercel:**
  - Frontend hosting remains free (with limits)
  - No serverless function costs after migration

## Next Steps

After successful migration:

1. ✅ Monitor Render logs for any issues
2. ✅ Set up Render health checks (optional)
3. ✅ Consider setting up a custom domain for Render (optional)
4. ✅ Update any documentation with new API URL
5. ✅ Remove `/api` directory if no longer needed

## Support

If you encounter issues:
- Check Render logs: Dashboard → Your service → Logs
- Check Vercel logs: Dashboard → Your project → Deployments → View function logs
- Review server code in `/server/index.js` for CORS configuration

