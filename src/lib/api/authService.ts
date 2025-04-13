import api from './apiClient';

// Auth service for handling authentication related API calls
const authService = {
  // Register a new user
  register: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    organizationName?: string;
  }) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Login user
  login: async (credentials: { email: string; password: string }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      // Store token in localStorage if returned
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get current user information
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Forgot password
  forgotPassword: async (email: string) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reset password
  resetPassword: async (token: string, password: string) => {
    try {
      const response = await api.post('/auth/reset-password', { token, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      
      // Remove token from localStorage
      localStorage.removeItem('token');
      
      return response.data;
    } catch (error) {
      // Still remove token even if API call fails
      localStorage.removeItem('token');
      throw error;
    }
  },
};

export default authService;
