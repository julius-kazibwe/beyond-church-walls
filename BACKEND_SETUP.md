# Backend Setup Guide

## Quick Start

1. **Install backend dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp .env.example server/.env
   ```

3. **Configure your email service in `server/.env`**

4. **Start the backend server:**
   ```bash
   cd server
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

5. **Update frontend API URL:**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:3001/api
   ```

6. **Start the frontend:**
   ```bash
   npm run dev
   ```

## Email Service Setup

### Gmail Setup (Easiest for testing)

1. Go to your Google Account settings
2. Enable 2-Step Verification
3. Generate an App Password: https://myaccount.google.com/apppasswords
4. Use that App Password in your `.env` file

### Other Email Providers

See `server/README.md` for SMTP and SendGrid configuration.

## Testing

1. Start the backend: `cd server && npm start`
2. Start the frontend: `npm run dev`
3. Test the forms on the website
4. Check `server/data/` for saved submissions
5. Check your email for notifications

## Deployment

See `server/README.md` for deployment options.

