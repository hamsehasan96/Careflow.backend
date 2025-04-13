import api from './apiClient';

// Appointment service for handling appointment related API calls
const appointmentService = {
  // Get all appointments
  getAllAppointments: async () => {
    try {
      const response = await api.get('/appointment');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get appointment by ID
  getAppointmentById: async (id: string) => {
    try {
      const response = await api.get(`/appointment/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get appointments by client ID
  getAppointmentsByClientId: async (clientId: string) => {
    try {
      const response = await api.get(`/appointment/participant/${clientId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get appointments by staff ID
  getAppointmentsByStaffId: async (staffId: string) => {
    try {
      const response = await api.get(`/appointment/staff/${staffId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new appointment
  createAppointment: async (appointmentData: any) => {
    try {
      const response = await api.post('/appointment', appointmentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update appointment
  updateAppointment: async (id: string, appointmentData: any) => {
    try {
      const response = await api.put(`/appointment/${id}`, appointmentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete appointment
  deleteAppointment: async (id: string) => {
    try {
      const response = await api.delete(`/appointment/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get appointments by date range
  getAppointmentsByDateRange: async (startDate: string, endDate: string) => {
    try {
      const response = await api.get(`/appointment/range?start=${startDate}&end=${endDate}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default appointmentService;
