# Production Deployment Checklist

## ✅ Security Fixes Applied

- [x] **XSS Protection**: All user input sanitized before insertion into HTML email templates
- [x] **Input Validation**: Proper email validation and input length limits added
- [x] **Security Headers**: Helmet middleware added for security headers
- [x] **Rate Limiting**: Added to prevent brute force and DDoS attacks
  - General API: 100 requests per 15 minutes per IP
  - Auth endpoints: 5 requests per 15 minutes per IP
- [x] **Request Size Limits**: Body parser limited to 10MB
- [x] **JWT Secret Warning**: Server warns if default secret is used in production

## 📦 Required Dependencies

Before deploying, install new dependencies:

```bash
cd server
npm install
```

New packages added:
- `helmet` - Security headers
- `express-rate-limit` - Rate limiting
- `express-validator` - Input validation (installed but can be used for more validation)

## 🔐 Environment Variables (Render)

Ensure these are set in Render:

### Required
- `NODE_ENV=production`
- `PORT=10000` (or Render's default)
- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Strong random secret (generate with: `openssl rand -base64 32`)
- `ADMIN_JWT_SECRET` - Strong random secret (different from JWT_SECRET)
- `FRONTEND_URL=https://www.bcws.info`

### Optional (for email)
- `EMAIL_SERVICE=gmail` (or `smtp`, `sendgrid`)
- `EMAIL_USER` - Your email
- `EMAIL_PASSWORD` - App password or API key
- `EMAIL_FROM` - Sender email
- `ADMIN_EMAIL` - Admin notification email

## ✅ Pre-Deployment Tests

1. **Health Check**
   ```bash
   curl https://beyond-church-walls.onrender.com/api/health
   ```
   Should return: `{"status":"ok","message":"Backend is running"}`

2. **CORS Test**
   - Visit https://www.bcws.info/
   - Open browser console
   - Try using the app
   - Verify no CORS errors

3. **Rate Limiting Test**
   - Make 6 rapid login attempts
   - 6th attempt should be rate limited

4. **Input Validation Test**
   - Try submitting invalid email formats
   - Try submitting very long inputs
   - Verify proper error messages

5. **XSS Protection Test**
   - Submit form with: `<script>alert('xss')</script>` in name field
   - Check admin email - should be sanitized

## 🚀 Deployment Steps

1. **Install Dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Test Locally** (optional)
   ```bash
   npm start
   ```

3. **Commit and Push**
   ```bash
   git add .
   git commit -m "Add security improvements for production"
   git push origin main
   ```

4. **Render will auto-deploy** (if connected to GitHub)

5. **Verify Deployment**
   - Check Render logs for errors
   - Test health endpoint
   - Test from frontend

## 📊 Monitoring

After deployment, monitor:

1. **Render Logs**
   - Check for MongoDB connection errors
   - Check for rate limiting triggers
   - Check for any security warnings

2. **Application Health**
   - Monitor `/api/health` endpoint
   - Check MongoDB connection status
   - Monitor email service status

3. **Error Rates**
   - Watch for spike in 400/500 errors
   - Monitor rate limit hits
   - Check for authentication failures

## 🔄 Rollback Plan

If issues occur:

1. **Quick Rollback**
   - Go to Render dashboard
   - Find previous successful deployment
   - Click "Rollback"

2. **Disable Rate Limiting** (if needed)
   - Comment out rate limiter middleware
   - Redeploy

3. **Disable Security Headers** (if needed)
   - Comment out helmet middleware
   - Redeploy

## ✅ Post-Deployment Verification

- [ ] Health endpoint responds correctly
- [ ] Frontend can connect to backend
- [ ] No CORS errors in browser console
- [ ] Email signup works
- [ ] Pre-order form works
- [ ] User authentication works
- [ ] Admin login works
- [ ] Rate limiting works (test with multiple requests)
- [ ] Input validation works (test with invalid inputs)
- [ ] MongoDB connection stable
- [ ] No security warnings in logs

## 📝 Notes

- Rate limiting is per IP address
- Security headers may need adjustment if using iframes or external resources
- Email templates now sanitize all user input
- All inputs have length limits to prevent DoS
- JWT secrets must be strong and unique in production

## 🆘 Troubleshooting

### Rate Limiting Too Aggressive
- Adjust limits in `server/index.js`
- Look for `limiter` and `authLimiter` configurations

### CORS Errors
- Verify `FRONTEND_URL` in Render matches exactly: `https://www.bcws.info`
- Check CORS configuration in `server/index.js`

### MongoDB Connection Issues
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas network access (should allow `0.0.0.0/0`)

### Email Not Sending
- Verify email environment variables
- Check Render logs for email errors
- Test email service configuration

