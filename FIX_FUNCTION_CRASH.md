# Fix: FUNCTION_INVOCATION_FAILED Error

## The Problem

The error `FUNCTION_INVOCATION_FAILED` means your serverless functions ARE deployed, but they're crashing when they try to execute. This is usually caused by:

1. **Missing environment variables** - Email configuration not set
2. **Missing dependencies** - `nodemailer` not installed
3. **Code errors** - Unhandled exceptions in the function

## Solution

### Step 1: Check Vercel Function Logs

1. Go to Vercel Dashboard → Your Project
2. Click **Functions** tab
3. Click on `/api/email-signup` (or the failing function)
4. Go to **Logs** tab
5. Look for error messages

**Common errors you might see:**
- `Cannot find module 'nodemailer'` - Dependencies not installed
- `EMAIL_SERVICE is not defined` - Environment variables not set
- `ADMIN_EMAIL is not defined` - Environment variables not set

### Step 2: Set Environment Variables

Go to **Vercel Dashboard → Settings → Environment Variables** and add:

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_FROM=your-email@gmail.com
ADMIN_EMAIL=info@inos.info
```

**Important:**
- Set for **Production**, **Preview**, and **Development**
- For Gmail, use an **App Password**, not your regular password
- See `GMAIL_SETUP.md` for instructions

### Step 3: Verify Dependencies

Make sure `nodemailer` is in `package.json`:

```json
{
  "dependencies": {
    "nodemailer": "^6.9.7"
  }
}
```

Then redeploy:
```bash
vercel --prod
```

### Step 4: Test Health Endpoint

After setting environment variables, test:

```
https://your-site.vercel.app/api/health
```

This should return JSON with status information.

## What I Fixed

1. ✅ Added try-catch around entire function to prevent crashes
2. ✅ Made email sending non-fatal (won't crash if email fails)
3. ✅ Added better error logging
4. ✅ Added environment variable checks
5. ✅ Improved error messages

## After Fixing

1. Set environment variables in Vercel
2. Redeploy: `vercel --prod`
3. Test `/api/health` endpoint
4. Submit forms again
5. Check function logs if still failing

## Quick Test

After setting environment variables, test in browser console:

```javascript
fetch('/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

This will show you if the function is working and what environment variables are set.

