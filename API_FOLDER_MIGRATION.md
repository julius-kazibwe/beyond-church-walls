# What to Do with the `/api` Folder

## Summary

The `/api` folder contains your **old Vercel serverless functions**. Since you've migrated to Render with an Express server in `/server`, these files are **no longer needed** for production.

## Current Situation

✅ **All functionality migrated:**
- All API endpoints are now in `/server/index.js` (Express server)
- Frontend is configured to use `VITE_API_URL` pointing to Render
- `vercel.json` no longer has API rewrites (only frontend routing)

❌ **Old serverless functions:**
- `/api/email-signup.js` → Now in `/server/index.js` as `/api/email-signup`
- `/api/pre-order.js` → Now in `/server/index.js` as `/api/pre-order`
- `/api/feedback.js` → Now in `/server/index.js` as `/api/feedback`
- `/api/health.js` → Now in `/server/index.js` as `/api/health`
- `/api/book-preview-access.js` → Now in `/server/index.js` as `/api/book-preview-access`
- `/api/book-preview-pdf.js` → Now in `/server/index.js` as `/api/book-preview-pdf`

## Recommended Action

### Option 1: Delete After Confirming Deployment (Recommended)

**Step 1: Deploy to Render and verify everything works**

**Step 2: Once confirmed working, delete the folder:**
```bash
rm -rf api/
git add .
git commit -m "Remove old Vercel serverless functions - migrated to Render"
git push origin main
```

**Why this is best:**
- Keeps codebase clean
- Prevents confusion about which API is being used
- Reduces repository size
- No risk of accidentally using old functions

### Option 2: Keep as Backup (Temporary)

If you want to keep it as a backup during initial deployment:

**Add to `.gitignore`:**
```bash
# Old Vercel serverless functions (migrated to Render)
/api/
```

**Then:**
```bash
git rm -r --cached api/
git add .gitignore
git commit -m "Ignore old API folder - keeping as local backup"
git push origin main
```

**Why this might be useful:**
- Can reference old code if needed
- Won't be deployed to Vercel (ignored)
- Can delete later when confident

### Option 3: Archive It

Move it to a backup location:
```bash
mkdir -p archive
mv api archive/api-vercel-serverless-backup
git add .
git commit -m "Archive old Vercel serverless functions"
git push origin main
```

## What Happens if You Keep It?

**If you keep `/api` folder:**
- ✅ Vercel will still try to use it as serverless functions
- ⚠️ This could cause confusion if someone accidentally uses `/api` routes
- ⚠️ You might have duplicate endpoints (old serverless + new Express)
- ⚠️ Frontend might accidentally use old endpoints if `VITE_API_URL` isn't set

**If you delete `/api` folder:**
- ✅ Cleaner codebase
- ✅ No confusion about which API to use
- ✅ Vercel will only serve frontend (as intended)
- ✅ All API calls go to Render (as intended)

## Verification Checklist

Before deleting, verify:

- [ ] Render deployment is working
- [ ] Health endpoint works: `https://beyond-church-walls.onrender.com/api/health`
- [ ] Frontend can connect to Render API
- [ ] All forms work (email signup, pre-order, feedback)
- [ ] User authentication works
- [ ] Admin login works
- [ ] No CORS errors in browser console

## My Recommendation

**Delete it after confirming deployment works.** Here's why:

1. **All functionality is migrated** - Nothing in `/api` is unique
2. **Cleaner codebase** - Less confusion for future development
3. **No risk** - You have Git history if you need to recover
4. **Best practice** - Remove dead code

**Steps:**
1. Deploy to Render
2. Test all functionality
3. Once confirmed working, delete `/api` folder
4. Commit and push

## Quick Command

Once you've confirmed everything works on Render:

```bash
# Delete the old API folder
rm -rf api/

# Commit the change
git add .
git commit -m "Remove old Vercel serverless functions - fully migrated to Render"
git push origin main
```

That's it! Your codebase will be cleaner and there will be no confusion about which API is being used.

