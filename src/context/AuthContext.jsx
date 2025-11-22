import { createContext, useContext, useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';
import { authenticatedFetch, saveAuth, clearAuth, getToken, getUser } from '../utils/auth';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authenticatedFetch(API_ENDPOINTS.AUTH_ME);
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            setUser(data.user);
          } else {
            console.error('Expected JSON response but got:', contentType);
            clearAuth();
          }
        } else {
          clearAuth();
        }
      } catch (error) {
        console.error('Error loading user:', error);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const signup = async (email, password, name) => {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH_SIGNUP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Expected JSON but got:', text.substring(0, 200));
        
        // Check if it's a 404 or HTML error page
        if (response.status === 404 || text.includes('<!DOCTYPE') || text.includes('<html')) {
          return { 
            success: false, 
            error: 'API endpoint not found. Please make sure the backend server is running on port 3001 and has been restarted with the latest code.' 
          };
        }
        
        return { 
          success: false, 
          error: `Server returned invalid response (status: ${response.status}). Please check the server logs.` 
        };
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      saveAuth(data.token, data.user);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      // If it's already a parsed error, use it; otherwise it might be a JSON parse error
      if (error.message) {
        return { success: false, error: error.message };
      }
      return { success: false, error: 'Failed to create account. Please try again.' };
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Attempting login for:', email);
      console.log('API endpoint:', API_ENDPOINTS.AUTH_LOGIN);
      
      const response = await fetch(API_ENDPOINTS.AUTH_LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      console.log('Login response status:', response.status);

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Expected JSON but got:', text.substring(0, 200));
        
        // Check if it's a 404 or HTML error page
        if (response.status === 404 || text.includes('<!DOCTYPE') || text.includes('<html')) {
          return { 
            success: false, 
            error: 'API endpoint not found. Please make sure the backend server is running on port 3001 and has been restarted with the latest code.' 
          };
        }
        
        return { 
          success: false, 
          error: `Server returned invalid response (status: ${response.status}). Please check the server logs.` 
        };
      }

      const data = await response.json();

      if (!response.ok) {
        // Provide more specific error message
        const errorMsg = data.error || 'Login failed';
        if (errorMsg.includes('Invalid email or password')) {
          throw new Error('Invalid email or password. Please check your credentials or sign up for a new account.');
        }
        throw new Error(errorMsg);
      }

      saveAuth(data.token, data.user);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      // If it's already a parsed error, use it; otherwise it might be a JSON parse error
      if (error.message) {
        return { success: false, error: error.message };
      }
      return { success: false, error: 'Failed to login. Please try again.' };
    }
  };

  const logout = () => {
    clearAuth();
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    const token = getToken();
    if (token) {
      saveAuth(token, updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

