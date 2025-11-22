# Quick Setup: Render Backend with Vercel Frontend

## Your URLs

- **Frontend**: https://www.bcws.info/
- **Backend API**: https://beyond-church-walls.onrender.com

## Step 1: Configure Render Environment Variables

Go to your Render dashboard → `beyond-church-walls-api` service → Environment tab

Add these environment variables:

### Required Variables

```
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://www.bcws.info
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret-here
ADMIN_JWT_SECRET=your-admin-jwt-secret-here
```

### Optional Variables (for email functionality)

```
JWT_EXPIRES_IN=7d
ADMIN_JWT_EXPIRES_IN=24h
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_FROM=your-email@gmail.com
ADMIN_EMAIL=your-admin-email@example.com
```

### Generate Secrets

If you need to generate JWT secrets, run:
```bash
openssl rand -base64 32
```

Run it twice - once for `JWT_SECRET` and once for `ADMIN_JWT_SECRET`.

## Step 2: Configure Vercel Frontend

1. Go to your Vercel project dashboard: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add a new variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://beyond-church-walls.onrender.com`
   - **Environment**: Select **Production**, **Preview**, and **Development**
5. Click **Save**

## Step 3: Redeploy

### Redeploy Render (if needed)
- Render will auto-deploy when you push to GitHub
- Or manually trigger a deploy from Render dashboard

### Redeploy Vercel
1. Go to **Deployments** tab in Vercel
2. Click the three dots (⋯) on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger auto-deploy

## Step 4: Verify Setup

### Test Backend Health
Visit: https://beyond-church-walls.onrender.com/api/health

Expected response:
```json
{
  "status": "ok",
  "message": "Backend is running"
}
```

### Test Frontend Connection
1. Visit: https://www.bcws.info/
2. Open browser DevTools (F12) → **Network** tab
3. Try using the app (login, signup, etc.)
4. Verify API calls are going to: `https://beyond-church-walls.onrender.com`

### Check for CORS Errors
- Open browser console (F12 → Console tab)
- Look for any CORS-related errors
- If you see CORS errors, verify `FRONTEND_URL` in Render matches exactly: `https://www.bcws.info`

## Troubleshooting

### CORS Errors
- **Check**: `FRONTEND_URL` in Render = `https://www.bcws.info` (no trailing slash)
- **Check**: Render logs for CORS-related messages
- **Fix**: Update `FRONTEND_URL` in Render and redeploy

### API Calls Not Working
- **Check**: `VITE_API_URL` is set in Vercel
- **Check**: Vercel deployment shows the environment variable
- **Fix**: Redeploy Vercel after adding the variable

### MongoDB Connection Issues
- **Check**: `MONGODB_URI` is correct in Render
- **Check**: MongoDB Atlas allows connections from Render (Network Access → Add IP: `0.0.0.0/0`)
- **Check**: Render logs for MongoDB connection errors

### Render Service Spinning Down
- Render free tier spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds (cold start)
- Consider upgrading to paid plan for always-on service

## Quick Reference

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | https://www.bcws.info/ | React app (Vercel) |
| Backend API | https://beyond-church-walls.onrender.com | Express server (Render) |
| Health Check | https://beyond-church-walls.onrender.com/api/health | Backend status |

## Next Steps

✅ Backend deployed to Render  
✅ Frontend configured to use Render backend  
✅ CORS configured for https://www.bcws.info  
✅ Environment variables set  

Your app should now be fully functional with the backend on Render and frontend on Vercel!

