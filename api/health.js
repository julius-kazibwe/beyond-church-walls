import { handleCors } from './utils/cors.js';

export default async (req, res) => {
  try {
    // Handle CORS
    if (handleCors(req, res)) return;

    if (req.method === 'GET') {
      res.status(200).json({ 
        status: 'ok', 
        message: 'Backend is running',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};

