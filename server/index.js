const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const { connectDB } = require('./utils/db');
const { generatePreviewToken, verifyPreviewToken, generateAuthToken, verifyAuthToken, generateAdminToken, verifyAdminToken, extractTokenFromHeader } = require('./utils/jwt');
const { createUser, findUserByEmail, findUserById, verifyPassword, updateLastLogin, saveUserProgress, getUserProgress, getAllUsers } = require('./utils/userStorageMongo');
const { getAdmin, verifyAdminPassword, updateAdminLastLogin } = require('./utils/adminStorageMongo');
const { getAllWeeklyContent, getWeekContent, saveWeeklyContent, deleteWeek } = require('./utils/weeklyContentStorageMongo');
const { getAllFeedback, getApprovedFeedback, addFeedback, updateFeedbackApproval, deleteFeedback } = require('./utils/feedbackStorageMongo');
const { getAllEndorsements, getApprovedEndorsements, addEndorsement, updateEndorsementApproval, updateEndorsement, deleteEndorsement } = require('./utils/endorsementStorageMongo');
const { getSiteSettings, updateSiteSettings } = require('./utils/siteSettingsStorageMongo');
const { saveSubmission, getSubmissions } = require('./utils/submissionStorageMongo');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security: Sanitize HTML to prevent XSS
const sanitizeHtml = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Validate email format
const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim()) && email.length <= 254;
};

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for API (can be configured if needed)
  crossOriginEmbedderPolicy: false,
}));

// Configure CORS FIRST (before rate limiting) to allow requests from Vercel frontend
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or same-origin requests)
    if (!origin) return callback(null, true);
    
    // In development, allow all localhost origins
    if (process.env.NODE_ENV !== 'production') {
      if (
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:') ||
        origin.startsWith('http://0.0.0.0:')
      ) {
        return callback(null, true);
      }
    }
    
    // In production, allow specific frontend domains
    const allowedOrigins = [
      process.env.FRONTEND_URL, // Set this in Render environment variables (https://www.bcws.info/)
      'https://www.bcws.info', // Production frontend
      'https://www.bcws.info/', // Production frontend with trailing slash
      /\.vercel\.app$/, // Allow all Vercel preview deployments
      /\.vercel\.com$/, // Allow Vercel production domains
    ];
    
    // Check if origin matches any allowed pattern
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed;
      } else if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Rate limiting (AFTER CORS) - only in production
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Higher limit in development
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for localhost in development
    if (process.env.NODE_ENV !== 'production') {
      const ip = req.ip || req.connection.remoteAddress;
      return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1' || ip?.includes('127.0.0.1');
    }
    return false;
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 50, // Higher limit in development
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for localhost in development
    if (process.env.NODE_ENV !== 'production') {
      const ip = req.ip || req.connection.remoteAddress;
      return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1' || ip?.includes('127.0.0.1');
    }
    return false;
  },
});

app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);
app.use('/api/admin/login', authLimiter);

// Body parser with size limits
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

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
// saveSubmission is now imported from submissionStorageMongo

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

    // Validate email
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!isValidEmail(trimmedEmail)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    // Save submission
    await saveSubmission('email-signup', { email: trimmedEmail });

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
      trimmedEmail,
      'Welcome to Beyond Church Walls',
      userEmailHtml,
      `Thank you for signing up! We'll keep you updated about Beyond Church Walls.`
    );

    // Notify admin (sanitize email for display)
    const adminEmailHtml = `
      <h3>New Email Signup</h3>
      <p><strong>Email:</strong> ${sanitizeHtml(trimmedEmail)}</p>
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
    const { name, email, phone, interest, message, title } = req.body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    if (!interest || typeof interest !== 'string' || interest.trim().length === 0) {
      return res.status(400).json({ error: 'Interest is required' });
    }

    // Validate and sanitize inputs
    const trimmedName = sanitizeHtml(name.trim().substring(0, 100)); // Limit length
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone ? phone.trim().substring(0, 20) : '';
    const trimmedInterest = interest.trim().substring(0, 100);
    const trimmedMessage = message ? sanitizeHtml(message.trim().substring(0, 1000)) : '';
    const trimmedTitle = title ? sanitizeHtml(title.trim().substring(0, 100)) : '';

    if (!isValidEmail(trimmedEmail)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    // If interest is "endorse", create an endorsement (unapproved by default)
    if (trimmedInterest === 'endorse') {
      if (!trimmedTitle || trimmedTitle.length === 0) {
        return res.status(400).json({ error: 'Title/Position is required for endorsements' });
      }
      if (!trimmedMessage || trimmedMessage.length === 0) {
        return res.status(400).json({ error: 'Endorsement quote is required' });
      }
      
      try {
        // Create endorsement (unapproved by default)
        const endorsement = await addEndorsement({
          name: trimmedName,
          title: trimmedTitle,
          quote: trimmedMessage,
          type: 'pastoral',
          approved: false
        });
        console.log('✅ Endorsement created successfully:', {
          id: endorsement.id,
          name: endorsement.name,
          type: endorsement.type,
          approved: endorsement.approved
        });
      } catch (endorsementError) {
        console.error('❌ Error creating endorsement:', endorsementError);
        // Don't fail the entire request if endorsement creation fails
        // The submission is still saved
      }
    }

    // Save submission
    await saveSubmission('pre-order', { 
      name: trimmedName, 
      email: trimmedEmail, 
      phone: trimmedPhone, 
      interest: trimmedInterest, 
      message: trimmedMessage,
      title: trimmedTitle
    });

    // Send confirmation email to user (sanitize for HTML)
    const userEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a237e;">Thank You for Your Interest!</h2>
        <p>Dear ${sanitizeHtml(trimmedName)},</p>
        <p>Thank you for your interest in <strong>Beyond Church Walls</strong>.</p>
        <p>We've received your request regarding: <strong>${sanitizeHtml(trimmedInterest)}</strong></p>
        ${trimmedMessage ? `<p>Your message: "${sanitizeHtml(trimmedMessage)}"</p>` : ''}
        <p>We'll be in touch soon with more information.</p>
        <p>Blessings,<br>The Beyond Church Walls Team</p>
      </div>
    `;

    await sendEmail(
      trimmedEmail,
      'Thank You for Your Interest - Beyond Church Walls',
      userEmailHtml,
      `Thank you for your interest! We'll be in touch soon.`
    );

    // Notify admin (sanitize all inputs)
    const adminEmailHtml = `
      <h3>New Pre-Order/Interest Submission</h3>
      <p><strong>Name:</strong> ${sanitizeHtml(trimmedName)}</p>
      <p><strong>Email:</strong> ${sanitizeHtml(trimmedEmail)}</p>
      <p><strong>Phone:</strong> ${trimmedPhone ? sanitizeHtml(trimmedPhone) : 'Not provided'}</p>
      <p><strong>Interest:</strong> ${sanitizeHtml(trimmedInterest)}</p>
      ${trimmedMessage ? `<p><strong>Message:</strong> ${sanitizeHtml(trimmedMessage)}</p>` : ''}
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
    `;

    await sendEmail(
      process.env.ADMIN_EMAIL,
      `New ${sanitizeHtml(trimmedInterest)} Request - Beyond Church Walls`,
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

    // Validate email
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!isValidEmail(trimmedEmail)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    // Save submission
    await saveSubmission('book-preview', { email: trimmedEmail });

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
      trimmedEmail,
      'Access Granted - Beyond Church Walls Preview',
      userEmailHtml,
      `Thank you! You now have access to preview Beyond Church Walls.`
    );

    // Notify admin (sanitize email)
    const adminEmailHtml = `
      <h3>New Book Preview Access Request</h3>
      <p><strong>Email:</strong> ${sanitizeHtml(trimmedEmail)}</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
    `;

    await sendEmail(
      process.env.ADMIN_EMAIL,
      'New Book Preview Access - Beyond Church Walls',
      adminEmailHtml
    );

    // Generate JWT token for PDF access
    const token = generatePreviewToken(trimmedEmail);

    res.json({ 
      success: true, 
      message: 'Access granted',
      token // Return token to frontend
    });
  } catch (error) {
    console.error('Book preview access error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Feedback routes (public - only approved feedback)
app.get('/api/feedback', async (req, res) => {
  try {
    const approvedFeedback = await getApprovedFeedback();
    res.json({
      success: true,
      feedback: approvedFeedback
    });
  } catch (error) {
    console.error('Feedback GET error:', error);
    res.status(500).json({
      error: 'Failed to fetch feedback',
      message: error.message
    });
  }
});

app.post('/api/feedback', async (req, res) => {
  try {
    const { name, email, message, title } = req.body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Validate and sanitize inputs
    const trimmedName = sanitizeHtml(name.trim().substring(0, 100));
    const trimmedTitle = title ? sanitizeHtml(title.trim().substring(0, 100)) : '';
    const trimmedMessage = sanitizeHtml(message.trim().substring(0, 2000));
    const trimmedEmail = email.trim().toLowerCase();

    // Validate email format
    if (!isValidEmail(trimmedEmail)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    // Add feedback to store (defaults to not approved)
    // Pass as object to match feedbackStorageMongo.js signature
    const feedback = await addFeedback({
      name: trimmedName,
      email: trimmedEmail,
      message: trimmedMessage,
      title: trimmedTitle
    });

    // Send confirmation email to user (sanitize for HTML)
    const userEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <p>Dear ${sanitizeHtml(trimmedName)},</p>
        <p>Thank you for sharing your feedback about <strong>Beyond Church Walls: Where Work and Worship Intersect</strong>.</p>
        <p>Your feedback means a lot to us. It helps us understand the impact of this message and encourages others in their journey of faith and work.</p>
        <p>We pray this book encourages and equips you to live out your faith in every area of life.</p>
        <p>Warm regards,</p>
        <p>Rev. John William Kasirye</p>
      </div>
    `;

    // Try to send email, but don't fail if email service isn't configured
    if (trimmedEmail) {
      await sendEmail(
        trimmedEmail,
        'Thank You for Your Feedback - Beyond Church Walls',
        userEmailHtml,
        `Thank you for your feedback!`
      );
    }

    // Notify admin (only if ADMIN_EMAIL is set) - sanitize all inputs
    if (process.env.ADMIN_EMAIL) {
      const adminEmailHtml = `
        <h3>New Feedback Submission</h3>
        <p><strong>Name:</strong> ${sanitizeHtml(trimmedName)}</p>
        <p><strong>Email:</strong> ${trimmedEmail ? sanitizeHtml(trimmedEmail) : 'Not provided'}</p>
        <p><strong>Title:</strong> ${trimmedTitle ? sanitizeHtml(trimmedTitle) : 'Not provided'}</p>
        <p><strong>Message:</strong> ${sanitizeHtml(trimmedMessage)}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      `;

      await sendEmail(
        process.env.ADMIN_EMAIL,
        'New Feedback Submission - Beyond Church Walls',
        adminEmailHtml
      );
    }

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback: feedback
    });
  } catch (error) {
    console.error('Feedback POST error:', error);
    res.status(500).json({
      error: 'Failed to process feedback',
      message: error.message
    });
  }
});

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const token = extractTokenFromHeader(req);
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const decoded = verifyAuthToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const user = await findUserById(decoded.userId);
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  req.user = user;
  next();
};

// Admin authentication middleware
const authenticateAdmin = async (req, res, next) => {
  const token = extractTokenFromHeader(req);
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const decoded = verifyAdminToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

    const admin = await getAdmin(decoded.email);
    if (!admin) {
      return res.status(401).json({ error: 'Admin not found' });
    }

  req.admin = admin;
  next();
};

// Authentication Routes

// User signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    const trimmedEmail = email.trim().toLowerCase();
    if (!isValidEmail(trimmedEmail)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    // Validate password
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    if (password.length > 128) {
      return res.status(400).json({ error: 'Password is too long' });
    }

    // Validate and sanitize name
    const trimmedName = name ? name.trim().substring(0, 100) : '';

    const user = await createUser(trimmedEmail, password, trimmedName);
    const token = generateAuthToken(user.id, user.email);
    await updateLastLogin(user.id);

    res.json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        progress: user.progress
      }
    });
  } catch (error) {
    if (error.message === 'User already exists') {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// User login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!isValidEmail(trimmedEmail)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const user = await findUserByEmail(trimmedEmail);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValidPassword = await verifyPassword(user, password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateAuthToken(user.id, user.email);
    await updateLastLogin(user.id);

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        progress: user.progress
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        progress: req.user.progress,
        createdAt: req.user.createdAt,
        lastLogin: req.user.lastLogin
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

// Progress Routes

// Get user progress
app.get('/api/progress', authenticateToken, async (req, res) => {
  try {
    const progress = await getUserProgress(req.user.id);
    res.json({
      success: true,
      progress: progress || {
        baselineCompleted: false,
        baselineFRIQ: null,
        completedWeeks: [],
        assessments: {},
        currentWeek: 0,
        reflections: {},
        practicalApplications: {}
      }
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Failed to get progress' });
  }
});

// Save user progress
app.post('/api/progress', authenticateToken, async (req, res) => {
  try {
    const progress = req.body.progress;
    
    if (!progress) {
      return res.status(400).json({ error: 'Progress data is required' });
    }

    const savedProgress = await saveUserProgress(req.user.id, progress);
    res.json({
      success: true,
      message: 'Progress saved successfully',
      progress: savedProgress
    });
  } catch (error) {
    console.error('Save progress error:', error);
    res.status(500).json({ error: 'Failed to save progress' });
  }
});

// Sync progress from localStorage (migration)
app.post('/api/progress/sync', authenticateToken, async (req, res) => {
  try {
    const localProgress = req.body.progress;
    
    if (!localProgress) {
      return res.status(400).json({ error: 'Progress data is required' });
    }

    // Get existing server progress (already cleaned by getUserProgress)
    const serverProgress = await getUserProgress(req.user.id) || {
      baselineCompleted: false,
      baselineFRIQ: null,
      completedWeeks: [],
      assessments: {},
      currentWeek: 0,
      reflections: {},
      practicalApplications: {}
    };

    // Clean local progress to ensure it's plain objects
    const cleanLocalProgress = (progress) => {
      if (!progress || typeof progress !== 'object') {
        return {
          baselineCompleted: false,
          baselineFRIQ: null,
          completedWeeks: [],
          assessments: {},
          currentWeek: 0,
          reflections: {},
          practicalApplications: {}
        };
      }
      
      return {
        baselineCompleted: progress.baselineCompleted || false,
        baselineFRIQ: typeof progress.baselineFRIQ === 'number' ? progress.baselineFRIQ : null,
        completedWeeks: Array.isArray(progress.completedWeeks) ? progress.completedWeeks : [],
        assessments: progress.assessments && typeof progress.assessments === 'object' && !(progress.assessments instanceof Map)
          ? progress.assessments 
          : {},
        currentWeek: typeof progress.currentWeek === 'number' ? progress.currentWeek : 0,
        reflections: progress.reflections && typeof progress.reflections === 'object' && !(progress.reflections instanceof Map)
          ? progress.reflections 
          : {},
        practicalApplications: progress.practicalApplications && typeof progress.practicalApplications === 'object' && !(progress.practicalApplications instanceof Map)
          ? progress.practicalApplications 
          : {}
      };
    };

    const cleanedLocal = cleanLocalProgress(localProgress);
    const cleanedServer = cleanLocalProgress(serverProgress); // Double-clean to be safe

    // Merge: server progress takes precedence, but fill in gaps from local
    const mergedProgress = {
      baselineCompleted: cleanedServer.baselineCompleted || cleanedLocal.baselineCompleted || false,
      baselineFRIQ: cleanedServer.baselineFRIQ || cleanedLocal.baselineFRIQ || null,
      completedWeeks: [...new Set([...cleanedServer.completedWeeks, ...cleanedLocal.completedWeeks])].sort((a, b) => a - b),
      assessments: { ...cleanedLocal.assessments, ...cleanedServer.assessments },
      currentWeek: Math.max(cleanedServer.currentWeek || 0, cleanedLocal.currentWeek || 0),
      reflections: { ...cleanedLocal.reflections, ...cleanedServer.reflections },
      practicalApplications: { ...cleanedLocal.practicalApplications, ...cleanedServer.practicalApplications }
    };

    const savedProgress = await saveUserProgress(req.user.id, mergedProgress);
    res.json({
      success: true,
      message: 'Progress synced successfully',
      progress: savedProgress
    });
  } catch (error) {
    console.error('Sync progress error:', error);
    res.status(500).json({ error: 'Failed to sync progress' });
  }
});

// Admin Routes

// Admin login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!isValidEmail(trimmedEmail)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const admin = await getAdmin(trimmedEmail);
    if (!admin) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValidPassword = await verifyAdminPassword(admin, password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateAdminToken(trimmedEmail);
    // Update last login using admin ID, not email
    if (admin.id) {
      await updateAdminLastLogin(admin.id);
    }

    res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        email: admin.email,
        createdAt: admin.createdAt,
        lastLogin: admin.lastLogin
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get admin info
app.get('/api/admin/me', authenticateAdmin, async (req, res) => {
  try {
    res.json({
      success: true,
      admin: {
        email: req.admin.email,
        createdAt: req.admin.createdAt,
        lastLogin: req.admin.lastLogin
      }
    });
  } catch (error) {
    console.error('Get admin error:', error);
    res.status(500).json({ error: 'Failed to get admin info' });
  }
});

// Helper function to read all submission files
// getAllSubmissions is now replaced by getSubmissions from submissionStorageMongo

// Get all email signups
app.get('/api/admin/email-signups', authenticateAdmin, async (req, res) => {
  try {
    const signups = await getSubmissions('email-signup');
    res.json({
      success: true,
      count: signups.length,
      signups
    });
  } catch (error) {
    console.error('Error fetching email signups:', error);
    res.status(500).json({ error: 'Failed to fetch email signups' });
  }
});

// Get all pre-orders
app.get('/api/admin/pre-orders', authenticateAdmin, async (req, res) => {
  try {
    const preOrders = await getSubmissions('pre-order');
    res.json({
      success: true,
      count: preOrders.length,
      preOrders
    });
  } catch (error) {
    console.error('Error fetching pre-orders:', error);
    res.status(500).json({ error: 'Failed to fetch pre-orders' });
  }
});

// Get all book preview access requests
app.get('/api/admin/book-previews', authenticateAdmin, async (req, res) => {
  try {
    const previews = await getSubmissions('book-preview');
    res.json({
      success: true,
      count: previews.length,
      previews
    });
  } catch (error) {
    console.error('Error fetching book previews:', error);
    res.status(500).json({ error: 'Failed to fetch book previews' });
  }
});

// Get all feedback (admin - includes unapproved)
app.get('/api/admin/feedback', authenticateAdmin, async (req, res) => {
  try {
    const allFeedback = await getAllFeedback();
    res.json({
      success: true,
      count: allFeedback.length,
      feedback: allFeedback
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// Update feedback approval status
app.put('/api/admin/feedback/:id/approve', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { approved } = req.body;
    const feedback = await updateFeedbackApproval(id, approved === true);
    if (feedback) {
      res.json({
        success: true,
        message: approved ? 'Feedback approved' : 'Feedback unapproved',
        feedback
      });
    } else {
      res.status(404).json({ error: 'Feedback not found' });
    }
  } catch (error) {
    console.error('Error updating feedback approval:', error);
    res.status(500).json({ error: 'Failed to update feedback approval' });
  }
});

// Delete feedback
app.delete('/api/admin/feedback/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await deleteFeedback(id);
    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
});

// Endorsement routes (public - only approved)
app.get('/api/endorsements', async (req, res) => {
  try {
    const { type } = req.query;
    const approvedEndorsements = await getApprovedEndorsements(type || null);
    res.json({
      success: true,
      endorsements: approvedEndorsements
    });
  } catch (error) {
    console.error('Error fetching endorsements:', error);
    res.status(500).json({ error: 'Failed to fetch endorsements' });
  }
});

// Admin endorsement management
app.get('/api/admin/endorsements', authenticateAdmin, async (req, res) => {
  try {
    const allEndorsements = await getAllEndorsements();
    res.json({
      success: true,
      count: allEndorsements.length,
      endorsements: allEndorsements
    });
  } catch (error) {
    console.error('Error fetching endorsements:', error);
    res.status(500).json({ error: 'Failed to fetch endorsements' });
  }
});

app.post('/api/admin/endorsements', authenticateAdmin, async (req, res) => {
  try {
    const { name, title, quote, type } = req.body;
    if (!name || !quote) {
      return res.status(400).json({ error: 'Name and quote are required' });
    }
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    const endorsement = await addEndorsement({
      name: sanitizeHtml(name.trim()),
      title: sanitizeHtml(title.trim()),
      quote: sanitizeHtml(quote.trim()),
      type: type || 'pastoral',
      approved: false
    });
    res.json({
      success: true,
      message: 'Endorsement added successfully',
      endorsement
    });
  } catch (error) {
    console.error('Error adding endorsement:', error);
    res.status(500).json({ error: 'Failed to add endorsement' });
  }
});

app.put('/api/admin/endorsements/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const endorsement = await updateEndorsement(id, updates);
    if (endorsement) {
      res.json({
        success: true,
        message: 'Endorsement updated successfully',
        endorsement
      });
    } else {
      res.status(404).json({ error: 'Endorsement not found' });
    }
  } catch (error) {
    console.error('Error updating endorsement:', error);
    res.status(500).json({ error: 'Failed to update endorsement' });
  }
});

app.put('/api/admin/endorsements/:id/approve', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { approved } = req.body;
    const endorsement = await updateEndorsementApproval(id, approved === true);
    if (endorsement) {
      res.json({
        success: true,
        message: approved ? 'Endorsement approved' : 'Endorsement unapproved',
        endorsement
      });
    } else {
      res.status(404).json({ error: 'Endorsement not found' });
    }
  } catch (error) {
    console.error('Error updating endorsement approval:', error);
    res.status(500).json({ error: 'Failed to update endorsement approval' });
  }
});

app.delete('/api/admin/endorsements/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await deleteEndorsement(id);
    res.json({
      success: true,
      message: 'Endorsement deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting endorsement:', error);
    res.status(500).json({ error: 'Failed to delete endorsement' });
  }
});

// Site settings routes (public - get settings)
app.get('/api/site-settings', async (req, res) => {
  try {
    const settings = await getSiteSettings();
    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Error fetching site settings:', error);
    res.status(500).json({ error: 'Failed to fetch site settings' });
  }
});

// Admin site settings management
app.get('/api/admin/site-settings', authenticateAdmin, async (req, res) => {
  try {
    const settings = await getSiteSettings();
    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Error fetching site settings:', error);
    res.status(500).json({ error: 'Failed to fetch site settings' });
  }
});

app.put('/api/admin/site-settings', authenticateAdmin, async (req, res) => {
  try {
    const updates = req.body;
    const settings = await updateSiteSettings(updates);
    res.json({
      success: true,
      message: 'Site settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Error updating site settings:', error);
    res.status(500).json({ error: 'Failed to update site settings' });
  }
});

// Get all users
app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
  try {
    const users = await getAllUsers();
    
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get dashboard statistics
app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
  try {
    const emailSignups = await getSubmissions('email-signup');
    const preOrders = await getSubmissions('pre-order');
    const bookPreviews = await getSubmissions('book-preview');
    const feedback = await getAllFeedback();
    
    // Get all users from MongoDB
    const users = await getAllUsers();
    
    // Calculate stats by interest type
    const interestStats = {};
    preOrders.forEach(order => {
      const interest = order.data?.interest || 'unknown';
      interestStats[interest] = (interestStats[interest] || 0) + 1;
    });
    
    // Calculate stats by date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentSignups = emailSignups.filter(s => new Date(s.timestamp) >= thirtyDaysAgo).length;
    const recentPreOrders = preOrders.filter(o => new Date(o.timestamp) >= thirtyDaysAgo).length;
    const recentPreviews = bookPreviews.filter(p => new Date(p.timestamp) >= thirtyDaysAgo).length;
    const recentUsers = users.filter(u => new Date(u.createdAt) >= thirtyDaysAgo).length;
    
    res.json({
      success: true,
      stats: {
        total: {
          emailSignups: emailSignups.length,
          preOrders: preOrders.length,
          bookPreviews: bookPreviews.length,
          feedback: feedback.length,
          users: users.length
        },
        recent: {
          emailSignups: recentSignups,
          preOrders: recentPreOrders,
          bookPreviews: recentPreviews,
          users: recentUsers
        },
        interestBreakdown: interestStats
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Export data as CSV
app.get('/api/admin/export/:type', authenticateAdmin, async (req, res) => {
  try {
    const { type } = req.params;
    let data = [];
    let filename = '';
    
    switch (type) {
      case 'email-signups':
        data = await getSubmissions('email-signup');
        filename = 'email-signups.csv';
        break;
      case 'pre-orders':
        data = await getSubmissions('pre-order');
        filename = 'pre-orders.csv';
        break;
      case 'book-previews':
        data = await getSubmissions('book-preview');
        filename = 'book-previews.csv';
        break;
      case 'feedback':
        data = await getAllFeedback();
        filename = 'feedback.csv';
        break;
      default:
        return res.status(400).json({ error: 'Invalid export type' });
    }
    
    if (data.length === 0) {
      return res.status(404).json({ error: 'No data to export' });
    }
    
    // Convert to CSV
    const headers = Object.keys(data[0].data || data[0]);
    const csvRows = [
      ['Timestamp', ...headers].join(','),
      ...data.map(item => {
        const row = [item.timestamp || item.submittedAt];
        const itemData = item.data || item;
        headers.forEach(header => {
          const value = itemData[header] || '';
          row.push(`"${String(value).replace(/"/g, '""')}"`);
        });
        return row.join(',');
      })
    ];
    
    const csv = csvRows.join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Weekly Content API (public - for frontend)
app.get('/api/weekly-content', async (req, res) => {
  try {
    const allContent = await getAllWeeklyContent();
    res.json({
      success: true,
      content: allContent
    });
  } catch (error) {
    console.error('Error fetching weekly content:', error);
    res.status(500).json({ error: 'Failed to fetch weekly content' });
  }
});

app.get('/api/weekly-content/:weekNumber', async (req, res) => {
  try {
    const weekNumber = parseInt(req.params.weekNumber);
    const content = await getWeekContent(weekNumber);
    if (!content) {
      return res.status(404).json({ error: 'Week content not found' });
    }
    res.json({
      success: true,
      content
    });
  } catch (error) {
    console.error('Error fetching week content:', error);
    res.status(500).json({ error: 'Failed to fetch week content' });
  }
});

// Admin Weekly Content Management
app.get('/api/admin/weekly-content', authenticateAdmin, async (req, res) => {
  try {
    const allContent = await getAllWeeklyContent();
    res.json({
      success: true,
      content: allContent
    });
  } catch (error) {
    console.error('Error fetching weekly content:', error);
    res.status(500).json({ error: 'Failed to fetch weekly content' });
  }
});

app.get('/api/admin/weekly-content/:weekNumber', authenticateAdmin, async (req, res) => {
  try {
    const weekNumber = parseInt(req.params.weekNumber);
    const content = await getWeekContent(weekNumber);
    if (!content) {
      return res.status(404).json({ error: 'Week content not found' });
    }
    res.json({
      success: true,
      content
    });
  } catch (error) {
    console.error('Error fetching week content:', error);
    res.status(500).json({ error: 'Failed to fetch week content' });
  }
});

app.post('/api/admin/weekly-content/:weekNumber', authenticateAdmin, async (req, res) => {
  try {
    const weekNumber = parseInt(req.params.weekNumber);
    const content = req.body;
    
    // Validate required fields
    if (!content.title || !content.theme) {
      return res.status(400).json({ error: 'Title and theme are required' });
    }

    const saved = await saveWeeklyContent(weekNumber, content);
    res.json({
      success: true,
      message: 'Week content saved successfully',
      content: saved
    });
  } catch (error) {
    console.error('Error saving week content:', error);
    res.status(500).json({ error: 'Failed to save week content' });
  }
});

app.delete('/api/admin/weekly-content/:weekNumber', authenticateAdmin, async (req, res) => {
  try {
    const weekNumber = parseInt(req.params.weekNumber);
    await deleteWeek(weekNumber);
    res.json({
      success: true,
      message: 'Week content deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting week content:', error);
    res.status(500).json({ error: 'Failed to delete week content' });
  }
});

// Fetch Bible verse text
app.get('/api/bible-verse', async (req, res) => {
  try {
    const { reference } = req.query;
    
    if (!reference) {
      return res.status(400).json({ error: 'Scripture reference is required' });
    }

    // Fetch from Bible API (free, no API key needed)
    // Format: https://bible-api.com/{reference}
    // Example: https://bible-api.com/John%203:16
    const encodedReference = encodeURIComponent(reference);
    const bibleApiUrl = `https://bible-api.com/${encodedReference}`;
    
    console.log('Fetching from Bible API:', bibleApiUrl);
    
    // Use native fetch (Node.js 18+)
    const response = await fetch(bibleApiUrl);
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Bible API returned non-JSON:', text.substring(0, 200));
      return res.status(500).json({ 
        error: 'Invalid response from Bible API. Please check the reference format (e.g., "John 3:16" or "Genesis 2:15")' 
      });
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Scripture not found' }));
      return res.status(404).json({ 
        error: errorData.error || 'Scripture not found. Please check the reference format (e.g., "John 3:16" or "Genesis 2:15")' 
      });
    }
    
    const data = await response.json();
    
    // Check if the API returned an error
    if (data.error) {
      return res.status(404).json({ error: data.error });
    }
    
    // Clean up the text (remove extra newlines and whitespace)
    const cleanText = (data.text || '').trim().replace(/\n+/g, ' ').replace(/\s+/g, ' ');
    
    // Format: "Reference - Text"
    const formattedScripture = `${reference} - "${cleanText}"`;
    
    res.json({
      success: true,
      reference: reference,
      text: cleanText,
      formatted: formattedScripture
    });
  } catch (error) {
    console.error('Error fetching Bible verse:', error);
    res.status(500).json({ error: 'Failed to fetch scripture. Please try again.' });
  }
});

// Book preview PDF endpoint (protected)
app.get('/api/book-preview-pdf', async (req, res) => {
  try {
    // Extract token from Authorization header or query parameter
    const token = extractTokenFromHeader(req) || req.query.token;

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify token
    const decoded = verifyPreviewToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Read PDF file from public directory (relative to project root)
    // The server is in /server, so we need to go up one level to access /public
    const pdfPath = path.join(__dirname, '..', 'public', 'book-sample.pdf');
    
    let pdfBuffer;
    try {
      pdfBuffer = await fs.readFile(pdfPath);
    } catch (fileError) {
      console.error('Error reading PDF file:', fileError);
      return res.status(500).json({ error: 'Failed to load PDF' });
    }

    // Set headers to prevent downloading and force inline viewing
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="book-sample.pdf"');
    res.setHeader('Content-Length', pdfBuffer.length);
    
    // Additional headers to prevent downloading
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Send PDF
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Book preview PDF error:', error);
    res.status(500).json({ 
      error: 'Failed to serve PDF',
      message: error.message 
    });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  
  // Connect to MongoDB on startup
  try {
    await connectDB();
    console.log('✅ MongoDB connection initialized');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB on startup:', error.message);
    if (process.env.NODE_ENV === 'production') {
      console.error('⚠️  Server will continue but may not function correctly without MongoDB');
    }
  }
  
  if (!transporter) {
    console.warn('⚠️  Email service not configured. Emails will be logged to console only.');
    console.warn('   Please configure EMAIL_SERVICE in your .env file');
  }
});

