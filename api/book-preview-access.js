import { handleCors } from './utils/cors.js';
import { sendEmail } from './utils/email.js';
import { generatePreviewToken } from './utils/jwt.js';

export default async (req, res) => {
  try {
    // Handle CORS
    if (handleCors(req, res)) return;

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      res.status(400).json({ error: 'Valid email is required' });
      return;
    }

    // Send confirmation email to user
    const userEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <p>Dear Friend,</p>
        <p>Thank you for your interest in <strong>Beyond Church Walls: Where Work and Worship Intersect</strong>.</p>
        <p>You now have access to preview the book sample. We hope you enjoy reading it and that it inspires you in your journey of integrating faith and work.</p>
        <p>We pray this book encourages and equips you to live out your faith in every area of life.</p>
        <p>Warm regards,</p>
        <p>Rev. John William Kasirye</p>
      </div>
    `;

    // Try to send email, but don't fail if email service isn't configured
    try {
      await sendEmail(
        email,
        'Access Granted - Beyond Church Walls Preview',
        userEmailHtml,
        `Thank you! You now have access to preview Beyond Church Walls.`
      );
    } catch (emailError) {
      console.error('Email send error (non-fatal):', emailError);
      // Continue even if email fails
    }

    // Notify admin (only if ADMIN_EMAIL is set)
    if (process.env.ADMIN_EMAIL) {
      try {
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
      } catch (adminEmailError) {
        console.error('Admin email send error (non-fatal):', adminEmailError);
        // Continue even if admin email fails
      }
    }

    // Generate JWT token for PDF access
    const token = generatePreviewToken(email);

    res.status(200).json({ 
      success: true, 
      message: 'Access granted',
      token // Return token to frontend
    });
  } catch (error) {
    console.error('Book preview access error:', error);
    res.status(500).json({ 
      error: 'Failed to process request',
      message: error.message 
    });
  }
};

