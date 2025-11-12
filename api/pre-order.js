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
    const { name, email, phone, interest, message } = req.body;

    if (!name || !email || !interest) {
      res.status(400).json({ error: 'Name, email, and interest are required' });
      return;
    }

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

    // Try to send email, but don't fail if email service isn't configured
    try {
      await sendEmail(
        email,
        'Thank You for Your Interest - Beyond Church Walls',
        userEmailHtml,
        `Thank you for your interest! We'll be in touch soon.`
      );
    } catch (emailError) {
      console.error('Email send error (non-fatal):', emailError);
      // Continue even if email fails
    }

    // Notify admin (only if ADMIN_EMAIL is set)
    if (process.env.ADMIN_EMAIL) {
      try {
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
      } catch (adminEmailError) {
        console.error('Admin email send error (non-fatal):', adminEmailError);
        // Continue even if admin email fails
      }
    }

    res.status(200).json({ success: true, message: 'Submission received successfully' });
  } catch (error) {
    console.error('Pre-order error:', error);
    res.status(500).json({ 
      error: 'Failed to process submission',
      message: error.message 
    });
  }
};

