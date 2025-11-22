const jwt = require('jsonwebtoken');

// JWT secret - in production, use a strong secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'; // Token expires in 7 days

// Warn if using default secret in production
if (process.env.NODE_ENV === 'production' && JWT_SECRET === 'your-secret-key-change-in-production') {
  console.error('⚠️  WARNING: Using default JWT_SECRET in production! This is a security risk!');
  console.error('   Please set JWT_SECRET environment variable to a strong, random secret.');
}

/**
 * Generate a JWT token for book preview access
 * @param {string} email - User's email address
 * @returns {string} JWT token
 */
const generatePreviewToken = (email) => {
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
const verifyPreviewToken = (token) => {
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
 * Generate a JWT token for user authentication
 * @param {string} userId - User's ID
 * @param {string} email - User's email address
 * @returns {string} JWT token
 */
const generateAuthToken = (userId, email) => {
  const payload = {
    userId,
    email,
    type: 'auth',
    iat: Math.floor(Date.now() / 1000),
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * Generate a JWT token for admin authentication
 * @param {string} email - Admin's email address
 * @returns {string} JWT token
 */
const generateAdminToken = (email) => {
  const payload = {
    email,
    type: 'admin',
    iat: Math.floor(Date.now() / 1000),
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * Verify and decode an authentication JWT token
 * @param {string} token - JWT token to verify
 * @returns {object|null} Decoded token payload or null if invalid
 */
const verifyAuthToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verify it's an auth token
    if (decoded.type !== 'auth') {
      return null;
    }
    
    return decoded;
  } catch (error) {
    // Token is invalid, expired, or malformed
    return null;
  }
};

/**
 * Verify and decode an admin JWT token
 * @param {string} token - JWT token to verify
 * @returns {object|null} Decoded token payload or null if invalid
 */
const verifyAdminToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verify it's an admin token
    if (decoded.type !== 'admin') {
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
 * @param {object} req - Express request object
 * @returns {string|null} Token or null if not found
 */
const extractTokenFromHeader = (req) => {
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

module.exports = {
  generatePreviewToken,
  verifyPreviewToken,
  generateAuthToken,
  verifyAuthToken,
  generateAdminToken,
  verifyAdminToken,
  extractTokenFromHeader,
};

