import jwt from 'jsonwebtoken';

// JWT secret - in production, use a strong secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'; // Token expires in 7 days

/**
 * Generate a JWT token for book preview access
 * @param {string} email - User's email address
 * @returns {string} JWT token
 */
export const generatePreviewToken = (email) => {
  const payload = {
    email,
    type: 'book-preview',
    iat: Math.floor(Date.now() / 1000),
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @returns {object|null} Decoded token payload or null if invalid
 */
export const verifyPreviewToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verify it's a book preview token
    if (decoded.type !== 'book-preview') {
      return null;
    }
    
    return decoded;
  } catch (error) {
    // Token is invalid, expired, or malformed
    return null;
  }
};

/**
 * Extract token from Authorization header
 * @param {object} req - Request object
 * @returns {string|null} Token or null if not found
 */
export const extractTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  
  if (!authHeader) {
    return null;
  }
  
  // Support both "Bearer <token>" and just "<token>"
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return authHeader;
};

