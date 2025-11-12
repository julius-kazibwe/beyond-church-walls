const nodemailer = require('nodemailer');

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

// Helper function to send email
const sendEmail = async (to, subject, html, text) => {
  if (!transporter) {
    console.log('Email transporter not configured. Email would be sent to:', to);
    console.log('Subject:', subject);
    console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE);
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
    // Return success even if not configured, so the API doesn't fail
    return { success: false, message: 'Email service not configured' };
  }

  if (!to) {
    console.log('No recipient email provided');
    return { success: false, message: 'No recipient email' };
  }

  try {
    const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER;
    if (!fromEmail) {
      console.log('No FROM email configured');
      return { success: false, message: 'No FROM email configured' };
    }

    const mailOptions = {
      from: fromEmail,
      to: to,
      subject,
      html,
      text: text || subject, // Fallback to subject if no text provided
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      command: error.command
    });
    throw error; // Re-throw so caller can handle it
  }
};

module.exports = { sendEmail, transporter };

