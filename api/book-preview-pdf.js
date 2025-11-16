import { verifyPreviewToken, extractTokenFromHeader } from './utils/jwt.js';
import { readFile } from 'fs/promises';
import { join } from 'path';

export default async (req, res) => {
  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.status(200).end();
      return;
    }

    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    // Extract token from Authorization header or query parameter
    const token = extractTokenFromHeader(req) || req.query.token;

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    // Verify token
    const decoded = verifyPreviewToken(token);
    if (!decoded) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Read PDF file
    // In Vercel, the public folder is accessible, but we need to use the correct path
    // For serverless functions, we'll read from the public directory
    const pdfPath = join(process.cwd(), 'public', 'book-sample.pdf');
    
    let pdfBuffer;
    try {
      pdfBuffer = await readFile(pdfPath);
    } catch (fileError) {
      console.error('Error reading PDF file:', fileError);
      res.status(500).json({ error: 'Failed to load PDF' });
      return;
    }

    // Set CORS headers (without Content-Type)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Set headers to prevent downloading and force inline viewing
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="book-sample.pdf"');
    res.setHeader('Content-Length', pdfBuffer.length);
    
    // Additional headers to prevent downloading
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Send PDF
    res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error('Book preview PDF error:', error);
    res.status(500).json({ 
      error: 'Failed to serve PDF',
      message: error.message 
    });
  }
};

