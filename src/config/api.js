// API Configuration
// In production (Vercel), API routes are on the same domain, so use relative paths
// In development, use localhost backend or Vercel dev server

// Check if we're on Vercel (production) by checking the hostname
const isVercelProduction = typeof window !== 'undefined' && 
  (window.location.hostname.includes('vercel.app') || 
   window.location.hostname.includes('vercel.com') ||
   import.meta.env.PROD);

// Use environment variable if set, otherwise:
// - Use relative path /api for Vercel production (same domain)
// - Use localhost for local development
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL
  : (isVercelProduction || import.meta.env.PROD)
    ? '/api'  // Same domain in production
    : 'http://localhost:3001/api';  // Local backend for development

export const API_ENDPOINTS = {
  EMAIL_SIGNUP: `${API_BASE_URL}/email-signup`,
  PRE_ORDER: `${API_BASE_URL}/pre-order`,
  BOOK_PREVIEW_ACCESS: `${API_BASE_URL}/book-preview-access`,
  HEALTH: `${API_BASE_URL}/health`,
};

export default API_BASE_URL;

