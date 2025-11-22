# Quick Deploy to Vercel (Full-Stack)

> **Note**: This guide is for deploying with Vercel serverless functions.  
> **For Render deployment** (separate backend server), see [`MIGRATION_TO_RENDER.md`](./MIGRATION_TO_RENDER.md)

## ✅ What's Ready

- ✅ Frontend React app
- ✅ Backend serverless functions in `/api`
- ✅ All forms connected
- ✅ Email service configured
- ✅ Vercel configuration ready

## 🚀 Deploy in 3 Steps

### 1. Install Vercel CLI (if not already installed)
```bash
npm install -g vercel
```

### 2. Login and Deploy
```bash
vercel login
vercel
```

Follow the prompts, then:
```bash
vercel --prod
```

### 3. Set Environment Variables in Vercel Dashboard

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these (for Gmail):
```
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_FROM=your-email@gmail.com
ADMIN_EMAIL=info@inos.info
```

**Important**: Set for **Production**, **Preview**, and **Development** environments.

### 4. Redeploy (after adding env vars)
```bash
vercel --prod
```

Or just push to GitHub if you connected it.

## 📝 Get Gmail App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Generate an app password for "Mail"
3. Use that password (not your regular Gmail password)

See `GMAIL_SETUP.md` for detailed instructions.

## ✅ Test After Deployment

1. Visit your Vercel URL
2. Test `/api/health` endpoint
3. Submit email signup form
4. Submit pre-order form
5. Request book preview access
6. Check emails are received

## 📚 Full Documentation

- `VERCEL_FULLSTACK_DEPLOYMENT.md` - Complete deployment guide
- `GMAIL_SETUP.md` - Gmail configuration details
- `BACKEND_SETUP.md` - Backend setup (for local dev)

## 🎯 That's It!

Your full-stack app is now deployed on Vercel with:
- Frontend on the main domain
- Backend API at `/api/*`
- Everything on the same domain (no CORS issues)

