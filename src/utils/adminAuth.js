// Admin authentication utilities

const ADMIN_TOKEN_KEY = 'bcw_admin_token';
const ADMIN_KEY = 'bcw_admin';

// Save admin token and info to localStorage
export const saveAdminAuth = (token, admin) => {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
};

// Get admin token from localStorage
export const getAdminToken = () => {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
};

// Get admin from localStorage
export const getAdmin = () => {
  const adminStr = localStorage.getItem(ADMIN_KEY);
  if (!adminStr) return null;
  try {
    return JSON.parse(adminStr);
  } catch {
    return null;
  }
};

// Clear admin auth data
export const clearAdminAuth = () => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_KEY);
};

// Check if admin is authenticated
export const isAdminAuthenticated = () => {
  return !!getAdminToken();
};

// Get admin auth headers for API requests
export const getAdminAuthHeaders = () => {
  const token = getAdminToken();
  if (!token) return {};
  return {
    'Authorization': `Bearer ${token}`
  };
};

// Make authenticated admin API request
export const adminAuthenticatedFetch = async (url, options = {}) => {
  const token = getAdminToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // If unauthorized, clear auth
  if (response.status === 401) {
    clearAdminAuth();
    window.location.reload();
  }

  return response;
};

