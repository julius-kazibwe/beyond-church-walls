const { handleCors } = require('./utils/cors');

module.exports = async (req, res) => {
  try {
    // Handle CORS
    if (handleCors(req, res)) return;

    if (req.method === 'GET') {
      res.status(200).json({ 
        status: 'ok', 
        message: 'Backend is running',
        timestamp: new Date().toISOString(),
        nodeVersion: process.version,
        env: {
          hasEmailService: !!process.env.EMAIL_SERVICE,
          hasAdminEmail: !!process.env.ADMIN_EMAIL
        }
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Health check error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};

