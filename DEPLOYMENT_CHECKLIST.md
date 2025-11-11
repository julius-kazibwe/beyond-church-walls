# Deployment Checklist

## Pre-Deployment Checklist

### ✅ Frontend
- [x] All components updated with real content
- [x] Book cover image added
- [x] Author photo configured
- [x] Real endorsements added
- [x] Contact information updated
- [x] Forms connected to backend API
- [x] Responsive design tested
- [x] Favicons configured

### ⚠️ Backend Configuration
- [ ] Gmail credentials configured in `server/.env`
- [ ] Email service tested (send test email)
- [ ] Admin email set correctly
- [ ] Backend server tested locally

### 📝 Environment Variables

**Frontend (`.env`):**
```env
VITE_API_URL=https://your-backend-url.com/api
```

**Backend (`server/.env`):**
```env
PORT=3001
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
ADMIN_EMAIL=info@inos.info
```

### 🔒 Security
- [ ] `.env` files are in `.gitignore` (already done)
- [ ] No sensitive data in code
- [ ] API endpoints secured (consider adding rate limiting for production)

## Deployment Options

### Option 1: Vercel (Recommended - Easiest)

**Frontend:**
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in project root
3. Follow prompts
4. Set environment variable: `VITE_API_URL` = your backend URL

**Backend:**
1. Deploy backend separately to Railway, Render, or Heroku
2. Or use Vercel Serverless Functions (convert backend)

### Option 2: Netlify

**Frontend:**
1. Install Netlify CLI: `npm i -g netlify-cli`
2. Build: `npm run build`
3. Deploy: `netlify deploy --prod --dir=dist`
4. Set environment variable in Netlify dashboard

**Backend:**
- Deploy to Railway, Render, or Heroku separately

### Option 3: Railway (Full-Stack)

1. Connect GitHub repo to Railway
2. Deploy frontend and backend together
3. Set environment variables in Railway dashboard

### Option 4: Render

**Frontend:**
- Static Site deployment from GitHub
- Set environment variables

**Backend:**
- Web Service deployment
- Set environment variables

## Post-Deployment

### Testing
- [ ] Test all forms (email signup, pre-order, book preview)
- [ ] Verify emails are being sent
- [ ] Check mobile responsiveness
- [ ] Test all navigation links
- [ ] Verify PDF preview works
- [ ] Check contact information

### Monitoring
- [ ] Set up error tracking (optional: Sentry)
- [ ] Monitor form submissions
- [ ] Check email delivery rates

## Quick Deployment Commands

### Build Frontend
```bash
npm run build
```

### Test Backend Locally
```bash
cd server
npm start
```

### Test Production Build
```bash
npm run build
npm run preview
```

## Notes

- The backend must be deployed and running before the frontend can submit forms
- Update `VITE_API_URL` in frontend `.env` to point to your deployed backend
- Keep backend `.env` secure - never commit it to git
- Consider using a database instead of JSON files for production (optional upgrade)

