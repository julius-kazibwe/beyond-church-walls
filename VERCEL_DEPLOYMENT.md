# Deploy to Vercel - Step by Step Guide

## Method 1: Using Vercel CLI (Recommended)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```
This will open your browser to authenticate.

### Step 3: Deploy
```bash
vercel
```

Follow the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Your account
- **Link to existing project?** → No (first time) or Yes (if updating)
- **Project name?** → beyond-church-walls (or your choice)
- **Directory?** → `./` (current directory)
- **Override settings?** → No

### Step 4: Set Environment Variables
After deployment, set the environment variable in Vercel dashboard:
1. Go to your project on Vercel
2. Click **Settings** → **Environment Variables**
3. Add: `VITE_API_URL` = `https://your-backend-url.com/api`

### Step 5: Deploy to Production
```bash
vercel --prod
```

## Method 2: Using Vercel Dashboard (Easier)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-github-repo-url
git push -u origin main
```

### Step 2: Import to Vercel
1. Go to https://vercel.com
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Vercel will auto-detect Vite settings
5. Add environment variable: `VITE_API_URL` = `https://your-backend-url.com/api`
6. Click **Deploy**

## Configuration

The `vercel.json` file is already configured for:
- ✅ Build command: `npm run build`
- ✅ Output directory: `dist`
- ✅ SPA routing (all routes redirect to index.html)

## Environment Variables

**Required:**
- `VITE_API_URL` - Your backend API URL (e.g., `https://your-backend.railway.app/api`)

**Set in Vercel Dashboard:**
1. Project → Settings → Environment Variables
2. Add variable for Production, Preview, and Development
3. Redeploy after adding variables

## After Deployment

1. **Test your site** - Visit the Vercel URL
2. **Test forms** - Make sure backend is deployed and API URL is correct
3. **Custom domain** (optional) - Add in Vercel dashboard → Settings → Domains

## Troubleshooting

**Build fails?**
- Check build logs in Vercel dashboard
- Make sure all dependencies are in `package.json`

**Forms not working?**
- Verify `VITE_API_URL` is set correctly
- Check backend is deployed and accessible
- Check browser console for errors

**404 errors on refresh?**
- The `vercel.json` rewrites should handle this
- If issues persist, check Vercel routing settings

