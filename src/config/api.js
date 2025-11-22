// API Configuration
// 
// Migration from Vercel serverless to Render:
// - Set VITE_API_URL environment variable in Vercel to your Render server URL
// - Example: VITE_API_URL=https://beyond-church-walls.onrender.com/api
// - OR: VITE_API_URL=https://beyond-church-walls.onrender.com (will auto-append /api)
// 
// For development:
// - If VITE_API_URL is set, use it (will auto-append /api if needed)
// - Otherwise, use localhost backend (when running server locally)
// - Or use '/api' for Vercel dev server (if still using serverless functions)

// Helper function to ensure API base URL includes /api
const ensureApiPath = (url) => {
  if (!url) return url;
  
  // If it's a relative path starting with /api, return as is
  if (url.startsWith('/api')) return url;
  
  // If it's a full URL (http/https), ensure it ends with /api
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Remove trailing slash if present
    const cleanUrl = url.replace(/\/$/, '');
    // Append /api if not already present
    return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
  }
  
  // For localhost development, append /api if not present
  if (url.includes('localhost') && !url.endsWith('/api')) {
    return `${url.replace(/\/$/, '')}/api`;
  }
  
  // Default: append /api
  return url.endsWith('/api') ? url : `${url}/api`;
};

const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? ensureApiPath(import.meta.env.VITE_API_URL)
  : (import.meta.env.DEV 
      ? 'http://localhost:3001/api'  // Local development - point to local server with /api
      : '/api');  // Fallback to relative path (for Vercel serverless during migration)

export const API_ENDPOINTS = {
  EMAIL_SIGNUP: `${API_BASE_URL}/email-signup`,
  PRE_ORDER: `${API_BASE_URL}/pre-order`,
  BOOK_PREVIEW_ACCESS: `${API_BASE_URL}/book-preview-access`,
  BOOK_PREVIEW_PDF: `${API_BASE_URL}/book-preview-pdf`,
  FEEDBACK: `${API_BASE_URL}/feedback`,
  HEALTH: `${API_BASE_URL}/health`,
  // Auth endpoints
  AUTH_SIGNUP: `${API_BASE_URL}/auth/signup`,
  AUTH_LOGIN: `${API_BASE_URL}/auth/login`,
  AUTH_ME: `${API_BASE_URL}/auth/me`,
  // Progress endpoints
  PROGRESS: `${API_BASE_URL}/progress`,
  PROGRESS_SYNC: `${API_BASE_URL}/progress/sync`,
  // Admin endpoints
  ADMIN_LOGIN: `${API_BASE_URL}/admin/login`,
  ADMIN_ME: `${API_BASE_URL}/admin/me`,
  ADMIN_STATS: `${API_BASE_URL}/admin/stats`,
  ADMIN_EMAIL_SIGNUPS: `${API_BASE_URL}/admin/email-signups`,
  ADMIN_PRE_ORDERS: `${API_BASE_URL}/admin/pre-orders`,
  ADMIN_BOOK_PREVIEWS: `${API_BASE_URL}/admin/book-previews`,
  ADMIN_FEEDBACK: `${API_BASE_URL}/admin/feedback`,
  ADMIN_USERS: `${API_BASE_URL}/admin/users`,
  ADMIN_EXPORT: `${API_BASE_URL}/admin/export`,
  // Weekly content endpoints
  WEEKLY_CONTENT: `${API_BASE_URL}/weekly-content`,
  WEEKLY_CONTENT_WEEK: (weekNumber) => `${API_BASE_URL}/weekly-content/${weekNumber}`,
  // Admin weekly content endpoints
  ADMIN_WEEKLY_CONTENT: `${API_BASE_URL}/admin/weekly-content`,
  ADMIN_WEEKLY_CONTENT_WEEK: (weekNumber) => `${API_BASE_URL}/admin/weekly-content/${weekNumber}`,
  // Bible API
  BIBLE_VERSE: `${API_BASE_URL}/bible-verse`,
  // Endorsements
  ENDORSEMENTS: `${API_BASE_URL}/endorsements`,
  // Admin feedback/endorsement management
  ADMIN_FEEDBACK_APPROVE: (id) => `${API_BASE_URL}/admin/feedback/${id}/approve`,
  ADMIN_FEEDBACK_DELETE: (id) => `${API_BASE_URL}/admin/feedback/${id}`,
  ADMIN_ENDORSEMENTS: `${API_BASE_URL}/admin/endorsements`,
  ADMIN_ENDORSEMENT: (id) => `${API_BASE_URL}/admin/endorsements/${id}`,
  ADMIN_ENDORSEMENT_APPROVE: (id) => `${API_BASE_URL}/admin/endorsements/${id}/approve`,
  // Site settings
  SITE_SETTINGS: `${API_BASE_URL}/site-settings`,
  ADMIN_SITE_SETTINGS: `${API_BASE_URL}/admin/site-settings`,
};

export default API_BASE_URL;

