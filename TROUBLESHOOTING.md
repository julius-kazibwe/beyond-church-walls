# Troubleshooting "Failed to connect to server" Error

## Common Causes and Solutions

### 1. Check if Functions are Deployed

**In Vercel Dashboard:**
1. Go to your project
2. Click on **Functions** tab
3. Verify you see:
   - `/api/health`
   - `/api/email-signup`
   - `/api/pre-order`
   - `/api/book-preview-access`

**If functions are missing:**
- Make sure `/api` directory is in your repository
- Redeploy: `vercel --prod`

### 2. Test the Health Endpoint

Visit: `https://your-site.vercel.app/api/health`

**Expected response:**
```json
{
  "status": "ok",
  "message": "Backend is running",
  "timestamp": "2024-..."
}
```

**If you get 404:**
- Functions aren't deployed
- Check Vercel build logs

**If you get 500:**
- Check function logs in Vercel dashboard
- Look for error messages

### 3. Check Browser Console

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Submit a form
4. Look for error messages

**Common errors:**
- `Failed to fetch` - Network error, function not found
- `CORS error` - CORS headers not set correctly
- `404` - Function route not found

### 4. Check Vercel Function Logs

1. Go to Vercel Dashboard → Your Project
2. Click **Functions** tab
3. Click on a function (e.g., `/api/email-signup`)
4. Check **Logs** tab for errors

**Look for:**
- Module not found errors
- Environment variable errors
- Email service errors

### 5. Verify Environment Variables

**In Vercel Dashboard:**
1. Go to **Settings** → **Environment Variables**
2. Verify these are set:
   - `EMAIL_SERVICE`
   - `EMAIL_USER`
   - `EMAIL_PASSWORD`
   - `EMAIL_FROM`
   - `ADMIN_EMAIL`

**Important:** Set for **Production**, **Preview**, and **Development**

### 6. Test Locally with Vercel Dev

```bash
# Install Vercel CLI if not already
npm install -g vercel

# Run locally
vercel dev
```

This will:
- Start frontend dev server
- Run serverless functions locally
- Use environment variables from `.env.local`

**Create `.env.local` in root:**
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
ADMIN_EMAIL=info@inos.info
```

### 7. Check API Configuration

**In browser console, check:**
```javascript
// What URL is being used?
console.log(API_ENDPOINTS.EMAIL_SIGNUP);
```

**Should be:**
- Production: `/api/email-signup` (relative path)
- Local dev: `http://localhost:3001/api/email-signup`

### 8. Common Issues

#### Issue: Functions return 404
**Solution:** 
- Make sure files are in `/api` directory
- File names match routes (e.g., `email-signup.js` → `/api/email-signup`)
- Redeploy

#### Issue: CORS errors
**Solution:**
- CORS is already handled in functions
- Check browser console for specific CORS error
- Verify `Access-Control-Allow-Origin` header is set

#### Issue: Module not found
**Solution:**
- Make sure `nodemailer` is in `package.json` dependencies
- Run `npm install` before deploying
- Check Vercel build logs

#### Issue: Email not sending
**Solution:**
- Check environment variables are set
- Verify Gmail App Password is correct
- Check function logs for email errors

### 9. Debug Steps

1. **Test health endpoint first:**
   ```
   https://your-site.vercel.app/api/health
   ```

2. **If health works, test email-signup:**
   - Use browser DevTools → Network tab
   - Submit email signup form
   - Check the request/response

3. **Check response:**
   - Status code should be 200
   - Response should be JSON
   - Check for error messages

4. **If still failing:**
   - Check Vercel function logs
   - Check browser console
   - Verify environment variables
   - Test with `vercel dev` locally

### 10. Quick Fix Checklist

- [ ] Functions are in `/api` directory
- [ ] `package.json` includes `nodemailer`
- [ ] Environment variables are set in Vercel
- [ ] Health endpoint works: `/api/health`
- [ ] No errors in Vercel function logs
- [ ] No CORS errors in browser console
- [ ] API URL is correct (relative path `/api` in production)

## Still Having Issues?

1. **Check Vercel Status:** https://www.vercel-status.com/
2. **Review Vercel Docs:** https://vercel.com/docs/functions
3. **Check Function Logs:** Vercel Dashboard → Functions → Logs
4. **Test Locally:** `vercel dev` to debug

