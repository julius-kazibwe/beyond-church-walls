// API Configuration
// In production (Vercel), API routes are on the same domain, so use relative paths
// In development, use localhost backend or Vercel dev server

// Check if we're on Vercel (production) by checking the hostname
const isVercelProduction = typeof window !== 'undefined' && 
  (window.location.hostname.includes('vercel.app') || 
   window.location.hostname.includes('vercel.com') ||
   import.meta.env.PROD);

// Use environment variable if set, otherwise:
// - Use relative path /api for both production and development
// - When using 'vercel dev', it serves both frontend and API on the same port
// - When using 'npm run dev', API endpoints won't work (use 'vercel dev' instead)
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL
  : '/api';  // Relative path works with both Vercel production and 'vercel dev'

export const API_ENDPOINTS = {
  EMAIL_SIGNUP: `${API_BASE_URL}/email-signup`,
  PRE_ORDER: `${API_BASE_URL}/pre-order`,
  BOOK_PREVIEW_ACCESS: `${API_BASE_URL}/book-preview-access`,
  BOOK_PREVIEW_PDF: `${API_BASE_URL}/book-preview-pdf`,
  FEEDBACK: `${API_BASE_URL}/feedback`,
  HEALTH: `${API_BASE_URL}/health`,
};

export default API_BASE_URL;

