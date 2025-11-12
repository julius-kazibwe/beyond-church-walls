// Simple test function to verify serverless functions work
export default async (req, res) => {
  try {
    res.status(200).json({ 
      success: true, 
      message: 'Test function works!',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Test function error',
      message: error.message 
    });
  }
};

