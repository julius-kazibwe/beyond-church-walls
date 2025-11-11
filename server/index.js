const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
fs.mkdir(dataDir, { recursive: true }).catch(console.error);

// Email transporter configuration
const createTransporter = () => {
  // Option 1: Gmail (using App Password)
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // Use App Password, not regular password
      },
    });
  }
  
  // Option 2: SMTP (works with most email providers)
  if (process.env.EMAIL_SERVICE === 'smtp') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  
  // Option 3: SendGrid
  if (process.env.EMAIL_SERVICE === 'sendgrid') {
    return nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  }
  
  return null;
};

const transporter = createTransporter();

// Helper function to save submission to file
const saveSubmission = async (type, data) => {
  const timestamp = new Date().toISOString();
  const submission = {
    type,
    timestamp,
    data,
  };
  
  const filePath = path.join(dataDir, `${type}-${Date.now()}.json`);
  await fs.writeFile(filePath, JSON.stringify(submission, null, 2));
  return submission;
};

// Helper function to send email
const sendEmail = async (to, subject, html, text) => {
  if (!transporter) {
    console.log('Email transporter not configured. Email would be sent to:', to);
    console.log('Subject:', subject);
    return { success: false, message: 'Email service not configured' };
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: to || process.env.ADMIN_EMAIL,
      subject,
      html,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
};

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Email signup (Join Mission)
app.post('/api/email-signup', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    // Save submission
    await saveSubmission('email-signup', { email });

    // Send confirmation email to user
    const userEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a237e;">Thank You for Joining the Mission!</h2>
        <p>Dear Friend,</p>
        <p>Thank you for signing up to receive updates about <strong>Beyond Church Walls</strong> by Rev. John William Kasirye.</p>
        <p>We're excited to share this journey with you and will keep you informed about:</p>
        <ul>
          <li>Book launch updates</li>
          <li>Exclusive content and resources</li>
          <li>Special events and opportunities</li>
        </ul>
        <p>Stay tuned for more information coming soon!</p>
        <p>Blessings,<br>The Beyond Church Walls Team</p>
      </div>
    `;

    await sendEmail(
      email,
      'Welcome to Beyond Church Walls',
      userEmailHtml,
      `Thank you for signing up! We'll keep you updated about Beyond Church Walls.`
    );

    // Notify admin
    const adminEmailHtml = `
      <h3>New Email Signup</h3>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
    `;

    await sendEmail(
      process.env.ADMIN_EMAIL,
      'New Email Signup - Beyond Church Walls',
      adminEmailHtml
    );

    res.json({ success: true, message: 'Email signup successful' });
  } catch (error) {
    console.error('Email signup error:', error);
    res.status(500).json({ error: 'Failed to process signup' });
  }
});

// Pre-order form submission
app.post('/api/pre-order', async (req, res) => {
  try {
    const { name, email, phone, interest, message } = req.body;

    if (!name || !email || !interest) {
      return res.status(400).json({ error: 'Name, email, and interest are required' });
    }

    // Save submission
    await saveSubmission('pre-order', { name, email, phone, interest, message });

    // Send confirmation email to user
    const userEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a237e;">Thank You for Your Interest!</h2>
        <p>Dear ${name},</p>
        <p>Thank you for your interest in <strong>Beyond Church Walls</strong>.</p>
        <p>We've received your request regarding: <strong>${interest}</strong></p>
        ${message ? `<p>Your message: "${message}"</p>` : ''}
        <p>We'll be in touch soon with more information.</p>
        <p>Blessings,<br>The Beyond Church Walls Team</p>
      </div>
    `;

    await sendEmail(
      email,
      'Thank You for Your Interest - Beyond Church Walls',
      userEmailHtml,
      `Thank you for your interest! We'll be in touch soon.`
    );

    // Notify admin
    const adminEmailHtml = `
      <h3>New Pre-Order/Interest Submission</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
      <p><strong>Interest:</strong> ${interest}</p>
      ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
    `;

    await sendEmail(
      process.env.ADMIN_EMAIL,
      `New ${interest} Request - Beyond Church Walls`,
      adminEmailHtml
    );

    res.json({ success: true, message: 'Submission received successfully' });
  } catch (error) {
    console.error('Pre-order error:', error);
    res.status(500).json({ error: 'Failed to process submission' });
  }
});

// Book preview access (email gate)
app.post('/api/book-preview-access', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    // Save submission
    await saveSubmission('book-preview', { email });

    // Send confirmation email to user
    const userEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a237e;">Access Granted to Book Preview</h2>
        <p>Dear Friend,</p>
        <p>Thank you for your interest in <strong>Beyond Church Walls</strong>!</p>
        <p>You now have access to preview the book sample. We hope you enjoy reading it and that it inspires you in your journey of integrating faith and work.</p>
        <p>If you have any questions or would like to learn more, please don't hesitate to reach out.</p>
        <p>Blessings,<br>Rev. John William Kasirye<br>The Beyond Church Walls Team</p>
      </div>
    `;

    await sendEmail(
      email,
      'Access Granted - Beyond Church Walls Preview',
      userEmailHtml,
      `Thank you! You now have access to preview Beyond Church Walls.`
    );

    // Notify admin
    const adminEmailHtml = `
      <h3>New Book Preview Access Request</h3>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
    `;

    await sendEmail(
      process.env.ADMIN_EMAIL,
      'New Book Preview Access - Beyond Church Walls',
      adminEmailHtml
    );

    res.json({ success: true, message: 'Access granted' });
  } catch (error) {
    console.error('Book preview access error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  
  if (!transporter) {
    console.warn('⚠️  Email service not configured. Emails will be logged to console only.');
    console.warn('   Please configure EMAIL_SERVICE in your .env file');
  }
});

