import api from './apiClient';

// Settings service for handling user and organization settings
const settingsService = {
  // Get user profile
  getUserProfile: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update user profile
  updateUserProfile: async (profileData: any) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get organization details
  getOrganization: async () => {
    try {
      const response = await api.get('/organization');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update organization details
  updateOrganization: async (organizationData: any) => {
    try {
      const response = await api.put('/organization', organizationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get notification settings
  getNotificationSettings: async () => {
    try {
      const response = await api.get('/settings/notifications');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update notification settings
  updateNotificationSettings: async (notificationSettings: any) => {
    try {
      const response = await api.put('/settings/notifications', notificationSettings);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get subscription details
  getSubscription: async () => {
    try {
      const response = await api.get('/billing/subscription');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update subscription
  updateSubscription: async (subscriptionData: any) => {
    try {
      const response = await api.put('/billing/subscription', subscriptionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default settingsService;
