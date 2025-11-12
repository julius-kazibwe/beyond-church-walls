// API Configuration
// In production (Vercel), API routes are on the same domain, so use relative paths
// In development, use localhost backend or Vercel dev server
const isProduction = import.meta.env.PROD;
const isVercel = import.meta.env.VITE_VERCEL || false;

// Use relative paths for Vercel deployment (same domain)
// Use environment variable if set, otherwise use localhost for dev
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL
  : (isProduction || isVercel)
    ? '/api'  // Same domain in production
    : 'http://localhost:3001/api';  // Local backend for development

export const API_ENDPOINTS = {
  EMAIL_SIGNUP: `${API_BASE_URL}/email-signup`,
  PRE_ORDER: `${API_BASE_URL}/pre-order`,
  BOOK_PREVIEW_ACCESS: `${API_BASE_URL}/book-preview-access`,
  HEALTH: `${API_BASE_URL}/health`,
};

export default API_BASE_URL;

