# Gmail Setup Guide

## Step-by-Step Instructions

### 1. Enable 2-Step Verification

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** in the left sidebar
3. Under "Signing in to Google", find **2-Step Verification**
4. Click on it and follow the prompts to enable it (if not already enabled)

### 2. Generate an App Password

1. Go to: https://myaccount.google.com/apppasswords
   - Or navigate: Google Account → Security → 2-Step Verification → App passwords
2. Select **Mail** as the app
3. Select **Other (Custom name)** as the device
4. Enter a name like "Beyond Church Walls Backend"
5. Click **Generate**
6. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)
   - ⚠️ **Important:** You can only see this password once! Copy it immediately.

### 3. Update Your .env File

Edit `server/.env` and fill in your Gmail details:

```env
PORT=3001
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
EMAIL_FROM=your-email@gmail.com
ADMIN_EMAIL=info@inos.info
```

**Important Notes:**
- `EMAIL_USER`: Your full Gmail address (e.g., `yourname@gmail.com`)
- `EMAIL_PASSWORD`: The 16-character App Password (remove spaces if any)
- `EMAIL_FROM`: Usually the same as `EMAIL_USER`
- `ADMIN_EMAIL`: Where you want to receive notifications (can be different from Gmail)

### 4. Restart the Server

After updating the `.env` file, restart your backend server:

```bash
cd server
npm start
```

### 5. Test It

Try submitting a form on the website to test if emails are being sent!

## Troubleshooting

**"Invalid login" error?**
- Make sure you're using an App Password, not your regular Gmail password
- Verify 2-Step Verification is enabled
- Check that the App Password doesn't have spaces

**Emails not sending?**
- Check server logs for error messages
- Verify all fields in `.env` are filled correctly
- Make sure the App Password is correct

**"Less secure app access" error?**
- You don't need to enable "Less secure app access"
- Just use App Passwords (more secure!)

## Security Best Practices

- Never commit your `.env` file to git
- Keep your App Password secret
- If compromised, revoke the App Password and generate a new one

