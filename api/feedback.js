import { handleCors } from './utils/cors.js';
import { sendEmail } from './utils/email.js';
import { addFeedback, getAllFeedback } from './utils/feedback.js';

export default async (req, res) => {
  try {
    // Handle CORS
    if (handleCors(req, res)) return;

    if (req.method === 'POST') {
      const { name, email, message, title } = req.body;

      if (!name || !message) {
        res.status(400).json({ error: 'Name and message are required' });
        return;
      }

      // Add feedback to store
      const feedback = addFeedback(
        name,
        title || '', // Optional title/position
        message
      );

      // Send confirmation email to user
      const userEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <p>Dear ${name},</p>
          <p>Thank you for sharing your feedback about <strong>Beyond Church Walls: Where Work and Worship Intersect</strong>.</p>
          <p>Your feedback means a lot to us. It helps us understand the impact of this message and encourages others in their journey of faith and work.</p>
          <p>We pray this book encourages and equips you to live out your faith in every area of life.</p>
          <p>Warm regards,</p>
          <p>Rev. John William Kasirye</p>
        </div>
      `;

      // Try to send email, but don't fail if email service isn't configured
      if (email) {
        try {
          await sendEmail(
            email,
            'Thank You for Your Feedback - Beyond Church Walls',
            userEmailHtml,
            `Thank you for your feedback!`
          );
        } catch (emailError) {
          console.error('Email send error (non-fatal):', emailError);
          // Continue even if email fails
        }
      }

      // Notify admin (only if ADMIN_EMAIL is set)
      if (process.env.ADMIN_EMAIL) {
        try {
          const adminEmailHtml = `
            <h3>New Feedback Submission</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email || 'Not provided'}</p>
            <p><strong>Title:</strong> ${title || 'Not provided'}</p>
            <p><strong>Message:</strong> ${message}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          `;

          await sendEmail(
            process.env.ADMIN_EMAIL,
            'New Feedback Submission - Beyond Church Walls',
            adminEmailHtml
          );
        } catch (adminEmailError) {
          console.error('Admin email send error (non-fatal):', adminEmailError);
          // Continue even if admin email fails
        }
      }

      res.status(200).json({
        success: true,
        message: 'Feedback submitted successfully',
        feedback: feedback
      });
    } else if (req.method === 'GET') {
      // Get all feedback
      const allFeedback = getAllFeedback();
      res.status(200).json({
        success: true,
        feedback: allFeedback
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({
      error: 'Failed to process feedback',
      message: error.message
    });
  }
};

