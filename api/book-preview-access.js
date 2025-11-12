import { handleCors } from './utils/cors.js';
import { sendEmail } from './utils/email.js';

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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a237e;">Access Granted to Book Preview</h2>
        <p>Dear Friend,</p>
        <p>Thank you for your interest in <strong>Beyond Church Walls</strong>!</p>
        <p>You now have access to preview the book sample. We hope you enjoy reading it and that it inspires you in your journey of integrating faith and work.</p>
        <p>If you have any questions or would like to learn more, please don't hesitate to reach out.</p>
        <p>Blessings,<br>Rev. John William Kasirye<br>The Beyond Church Walls Team</p>
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

    res.status(200).json({ success: true, message: 'Access granted' });
  } catch (error) {
    console.error('Book preview access error:', error);
    res.status(500).json({ 
      error: 'Failed to process request',
      message: error.message 
    });
  }
};

