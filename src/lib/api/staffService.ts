import api from './apiClient';

// Staff service for handling staff/care worker related API calls
const staffService = {
  // Get all staff members
  getAllStaff: async () => {
    try {
      const response = await api.get('/careWorker');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get staff member by ID
  getStaffById: async (id: string) => {
    try {
      const response = await api.get(`/careWorker/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new staff member
  createStaff: async (staffData: any) => {
    try {
      const response = await api.post('/careWorker', staffData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update staff member
  updateStaff: async (id: string, staffData: any) => {
    try {
      const response = await api.put(`/careWorker/${id}`, staffData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete staff member
  deleteStaff: async (id: string) => {
    try {
      const response = await api.delete(`/careWorker/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get staff availability
  getStaffAvailability: async (staffId: string) => {
    try {
      const response = await api.get(`/careWorker/${staffId}/availability`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update staff availability
  updateStaffAvailability: async (staffId: string, availabilityData: any) => {
    try {
      const response = await api.put(`/careWorker/${staffId}/availability`, availabilityData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get staff clients
  getStaffClients: async (staffId: string) => {
    try {
      const response = await api.get(`/careWorker/${staffId}/participants`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default staffService;
