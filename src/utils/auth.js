// Authentication utilities

const TOKEN_KEY = 'bcw_auth_token';
const USER_KEY = 'bcw_user';

// Save token and user to localStorage
export const saveAuth = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// Get token from localStorage
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

// Get user from localStorage
export const getUser = () => {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

// Clear auth data
export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getToken();
};

// Get auth headers for API requests
export const getAuthHeaders = () => {
  const token = getToken();
  if (!token) return {};
  return {
    'Authorization': `Bearer ${token}`
  };
};

// Make authenticated API request
export const authenticatedFetch = async (url, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // If unauthorized, clear auth and redirect
    if (response.status === 401) {
      clearAuth();
      // Don't reload if we're already handling an error
      if (!response.ok && response.status !== 401) {
        window.location.reload();
      }
    }

    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

