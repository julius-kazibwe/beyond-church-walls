# Beyond Church Walls - Backend API

This is the backend server for the Beyond Church Walls book launch website. It handles form submissions, email notifications, and data storage.

## Features

- ✅ Email signup form handling
- ✅ Pre-order/interest form processing
- ✅ Book preview access management
- ✅ Automatic email notifications (to users and admin)
- ✅ Form submission storage (JSON files)
- ✅ CORS enabled for frontend integration

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `server` directory:

```bash
cp ../.env.example server/.env
```

Then edit `server/.env` with your configuration:

#### Option 1: Gmail (Recommended for testing)

```env
PORT=3001
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
ADMIN_EMAIL=admin@beyondchurchwalls.com
```

**Note:** For Gmail, you need to use an [App Password](https://support.google.com/accounts/answer/185833), not your regular password.

#### Option 2: SMTP (Any email provider)

```env
PORT=3001
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=your-email@yourdomain.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=your-email@yourdomain.com
ADMIN_EMAIL=admin@beyondchurchwalls.com
```

#### Option 3: SendGrid

```env
PORT=3001
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=your-email@yourdomain.com
ADMIN_EMAIL=admin@beyondchurchwalls.com
```

### 3. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will run on `http://localhost:3001` by default.

## API Endpoints

### Health Check
```
GET /api/health
```

### Email Signup
```
POST /api/email-signup
Body: { "email": "user@example.com" }
```

### Pre-Order Form
```
POST /api/pre-order
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "123-456-7890",
  "interest": "pre-order",
  "message": "Optional message"
}
```

### Book Preview Access
```
POST /api/book-preview-access
Body: { "email": "user@example.com" }
```

## Frontend Configuration

Update your frontend `.env` file (or create one):

```env
VITE_API_URL=http://localhost:3001/api
```

For production, set this to your deployed backend URL:
```env
VITE_API_URL=https://your-backend-domain.com/api
```

## Data Storage

Form submissions are automatically saved as JSON files in the `server/data/` directory:
- `email-signup-[timestamp].json`
- `pre-order-[timestamp].json`
- `book-preview-[timestamp].json`

## Email Templates

The server sends:
1. **Confirmation emails** to users who submit forms
2. **Notification emails** to the admin email address

You can customize the email templates in `server/index.js`.

## Deployment Options

### Option 1: Deploy Backend Separately

Deploy the backend to:
- **Heroku**: Easy Node.js deployment
- **Railway**: Simple deployment with environment variables
- **Render**: Free tier available
- **DigitalOcean App Platform**: Simple deployment
- **AWS/Google Cloud/Azure**: For enterprise solutions

### Option 2: Serverless Functions

Convert to serverless functions for:
- **Vercel**: Serverless functions
- **Netlify**: Netlify Functions
- **AWS Lambda**: Serverless architecture

### Option 3: Full-Stack Deployment

Deploy both frontend and backend together:
- **Vercel**: Can host both
- **Netlify**: Can host both with functions
- **Railway**: Can host both

## Troubleshooting

### Email not sending?
1. Check your `.env` file configuration
2. Verify email credentials are correct
3. For Gmail, ensure you're using an App Password
4. Check server logs for error messages

### CORS errors?
- The server has CORS enabled for all origins
- If issues persist, check your frontend API URL configuration

### Port already in use?
- Change `PORT` in your `.env` file
- Or kill the process using port 3001

## Security Notes

- Never commit `.env` files to git
- Use environment variables for all sensitive data
- Consider adding rate limiting for production
- Add input validation and sanitization
- Consider adding authentication for admin endpoints

## Next Steps

1. Set up your email service
2. Configure environment variables
3. Test all endpoints
4. Deploy backend to your hosting provider
5. Update frontend API URL for production

