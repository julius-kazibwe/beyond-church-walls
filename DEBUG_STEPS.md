# Debug Steps for "Failed to connect to server"

## Step 1: Check Browser Console

1. Open your deployed site
2. Press F12 to open DevTools
3. Go to **Console** tab
4. Look for the debug message: `API Base URL: /api`
5. Submit a form and check for errors

**What to look for:**
- Network errors
- CORS errors
- 404 errors
- Any error messages

## Step 2: Test Health Endpoint Directly

Open in browser: `https://your-site.vercel.app/api/health`

**Expected:** JSON response with status "ok"
**If 404:** Functions aren't deployed
**If 500:** Check function logs

## Step 3: Check Network Tab

1. Open DevTools → **Network** tab
2. Submit a form
3. Look for the request to `/api/email-signup` (or other endpoint)
4. Click on it to see:
   - **Status code** (should be 200)
   - **Response** (should be JSON)
   - **Request URL** (should be `/api/email-signup`)

## Step 4: Check Vercel Dashboard

1. Go to Vercel Dashboard
2. Click on your project
3. Go to **Functions** tab
4. Verify you see:
   - `/api/health`
   - `/api/email-signup`
   - `/api/pre-order`
   - `/api/book-preview-access`

**If functions are missing:**
- Make sure `/api` folder is committed to git
- Redeploy: `vercel --prod`

## Step 5: Check Function Logs

1. Vercel Dashboard → Your Project
2. **Functions** tab
3. Click on `/api/email-signup`
4. Go to **Logs** tab
5. Submit a form and watch for logs

**Look for:**
- "Email signup function called" (means function is running)
- Error messages
- Module not found errors

## Step 6: Test Locally with Vercel Dev

```bash
# Install Vercel CLI if not already
npm install -g vercel

# Create .env.local file
cat > .env.local << EOF
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
ADMIN_EMAIL=info@inos.info
EOF

# Run Vercel dev (this runs both frontend and functions)
vercel dev
```

Then test:
- Visit `http://localhost:3000/api/health`
- Submit forms
- Check if they work locally

## Step 7: Verify Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

**Required:**
- `EMAIL_SERVICE`
- `EMAIL_USER`
- `EMAIL_PASSWORD`
- `EMAIL_FROM`
- `ADMIN_EMAIL`

**Important:** Set for **Production**, **Preview**, and **Development**

## Step 8: Check Build Logs

1. Vercel Dashboard → Your Project
2. Go to **Deployments** tab
3. Click on latest deployment
4. Check **Build Logs** for errors

## Common Issues & Fixes

### Issue: Functions return 404
**Fix:**
- Make sure `/api` folder exists and is committed
- Files should be: `api/email-signup.js`, `api/health.js`, etc.
- Redeploy: `vercel --prod`

### Issue: "Module not found" in logs
**Fix:**
- Make sure `nodemailer` is in `package.json` dependencies
- Run `npm install` before deploying
- Check build logs

### Issue: CORS errors
**Fix:**
- CORS is already handled in functions
- Check if error is actually CORS or something else
- Verify `Access-Control-Allow-Origin` header is set

### Issue: Functions timeout
**Fix:**
- Check email service configuration
- Verify environment variables are set
- Check function logs for email errors

## Quick Test Script

Open browser console on your deployed site and run:

```javascript
// Test health endpoint
fetch('/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);

// Test email signup
fetch('/api/email-signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@example.com' })
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

This will show you exactly what's happening.

