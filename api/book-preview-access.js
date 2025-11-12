const { handleCors } = require('./utils/cors');
const { sendEmail } = require('./utils/email');

module.exports = async (req, res) => {
  // Handle CORS
  if (handleCors(req, res)) return;

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

    // Log submission
    console.log('Book preview access:', { 
      email, 
      timestamp: new Date().toISOString() 
    });

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

    res.status(200).json({ success: true, message: 'Access granted' });
  } catch (error) {
    console.error('Book preview access error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

