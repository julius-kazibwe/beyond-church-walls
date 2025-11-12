# Deploy Full-Stack to Vercel

This guide will help you deploy both the frontend and backend to Vercel as a single full-stack application.

## Architecture

- **Frontend**: React + Vite (served as static files)
- **Backend**: Vercel Serverless Functions (in `/api` directory)
- **Same Domain**: Both frontend and backend on the same Vercel domain

## Prerequisites

1. Vercel account: https://vercel.com
2. Vercel CLI installed: `npm install -g vercel`
3. Gmail App Password (or other email service credentials)

## Step 1: Install Dependencies

Make sure all dependencies are installed:

```bash
npm install
```

This will install both frontend and backend dependencies (including `nodemailer`).

## Step 2: Configure Environment Variables

You need to set environment variables in Vercel for the serverless functions.

### Required Environment Variables

Set these in Vercel Dashboard → Your Project → Settings → Environment Variables:

```env
# Email Configuration (Gmail example)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
ADMIN_EMAIL=info@inos.info

# Optional: If using SMTP instead
# EMAIL_SERVICE=smtp
# SMTP_HOST=smtp.your-provider.com
# SMTP_PORT=587
# SMTP_SECURE=false

# Optional: If using SendGrid
# EMAIL_SERVICE=sendgrid
# SENDGRID_API_KEY=your-sendgrid-api-key
```

**Important**: 
- For Gmail, use an [App Password](https://myaccount.google.com/apppasswords), not your regular password
- See `GMAIL_SETUP.md` for detailed Gmail setup instructions

## Step 3: Deploy to Vercel

### Option A: Using Vercel CLI

1. **Login to Vercel:**
   ```bash
   vercel login
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Follow the prompts:**
   - Set up and deploy? → **Yes**
   - Which scope? → Your account
   - Link to existing project? → **No** (first time) or **Yes** (updates)
   - Project name? → `beyond-church-walls` (or your choice)
   - Directory? → `./` (current directory)
   - Override settings? → **No**

4. **Set Environment Variables:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all the email configuration variables listed above
   - Make sure to set them for **Production**, **Preview**, and **Development**

5. **Deploy to Production:**
   ```bash
   vercel --prod
   ```

### Option B: Using Vercel Dashboard (GitHub)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-github-repo-url
   git push -u origin main
   ```

2. **Import to Vercel:**
   - Go to https://vercel.com
   - Click **Add New** → **Project**
   - Import your GitHub repository
   - Vercel will auto-detect settings

3. **Configure Environment Variables:**
   - In project settings, add all email environment variables
   - Set for Production, Preview, and Development

4. **Deploy:**
   - Click **Deploy**
   - Vercel will build and deploy automatically

## Step 4: Verify Deployment

1. **Check Frontend:**
   - Visit your Vercel URL (e.g., `https://beyond-church-walls.vercel.app`)
   - Verify the site loads correctly

2. **Check Backend:**
   - Visit `https://your-site.vercel.app/api/health`
   - Should return: `{"status":"ok","message":"Backend is running"}`

3. **Test Forms:**
   - Submit email signup form
   - Submit pre-order form
   - Request book preview access
   - Check that emails are received

## Project Structure

```
beyond-church-walls/
├── api/                    # Serverless functions
│   ├── email-signup.js
│   ├── pre-order.js
│   ├── book-preview-access.js
│   ├── health.js
│   └── utils/
│       ├── email.js
│       └── cors.js
├── src/                    # Frontend React code
├── public/                 # Static assets
├── dist/                   # Build output (generated)
├── vercel.json            # Vercel configuration
└── package.json           # Dependencies
```

## API Endpoints

All endpoints are available at `/api/*`:

- `GET /api/health` - Health check
- `POST /api/email-signup` - Email signup form
- `POST /api/pre-order` - Pre-order form
- `POST /api/book-preview-access` - Book preview access

## Troubleshooting

### Emails Not Sending?

1. **Check Environment Variables:**
   - Verify all email variables are set in Vercel
   - Make sure they're set for the correct environment (Production/Preview)

2. **Check Vercel Logs:**
   - Go to Vercel Dashboard → Your Project → Functions
   - Click on a function to see logs
   - Look for email errors

3. **Gmail App Password:**
   - Make sure you're using an App Password, not your regular password
   - See `GMAIL_SETUP.md` for instructions

### Functions Not Working?

1. **Check Function Logs:**
   - Vercel Dashboard → Functions → View logs

2. **Test Locally:**
   ```bash
   vercel dev
   ```
   This runs Vercel locally with serverless functions

3. **Check API Routes:**
   - Make sure files are in `/api` directory
   - File names match the route (e.g., `email-signup.js` → `/api/email-signup`)

### CORS Errors?

- CORS is already handled in the serverless functions
- If issues persist, check browser console for specific errors

## Local Development

To test locally with serverless functions:

```bash
# Install Vercel CLI globally if not already
npm install -g vercel

# Run Vercel dev server (includes serverless functions)
vercel dev
```

This will:
- Start the frontend dev server
- Run serverless functions locally
- Use environment variables from `.env.local` (create this file)

## Environment Variables for Local Dev

Create `.env.local` in the root directory:

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
ADMIN_EMAIL=info@inos.info
```

## Notes

- **No File Storage**: Serverless functions can't reliably save to filesystem. Submissions are logged to Vercel function logs instead.
- **Same Domain**: Frontend and backend are on the same domain, so no CORS issues
- **Automatic Scaling**: Vercel automatically scales serverless functions
- **Free Tier**: Vercel has a generous free tier for personal projects

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Set environment variables
3. ✅ Test all forms
4. ✅ Verify emails are working
5. ✅ (Optional) Add custom domain in Vercel settings

