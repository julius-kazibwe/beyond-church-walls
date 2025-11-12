const { handleCors } = require('./utils/cors');
const { sendEmail } = require('./utils/email');

module.exports = async (req, res) => {
  // Handle CORS
  if (handleCors(req, res)) return;

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      res.status(400).json({ error: 'Valid email is required' });
      return;
    }

    // Log submission (in serverless, we can't reliably save to filesystem)
    console.log('Email signup:', { email, timestamp: new Date().toISOString() });

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

    res.status(200).json({ success: true, message: 'Email signup successful' });
  } catch (error) {
    console.error('Email signup error:', error);
    res.status(500).json({ error: 'Failed to process signup' });
  }
};

