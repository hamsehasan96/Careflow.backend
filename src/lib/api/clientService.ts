import api from './apiClient';

// Client service for handling participant/client related API calls
const clientService = {
  // Get all clients
  getAllClients: async () => {
    try {
      const response = await api.get('/participant');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get client by ID
  getClientById: async (id: string) => {
    try {
      const response = await api.get(`/participant/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new client
  createClient: async (clientData: any) => {
    try {
      const response = await api.post('/participant', clientData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update client
  updateClient: async (id: string, clientData: any) => {
    try {
      const response = await api.put(`/participant/${id}`, clientData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete client
  deleteClient: async (id: string) => {
    try {
      const response = await api.delete(`/participant/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get client care notes
  getClientCareNotes: async (clientId: string) => {
    try {
      const response = await api.get(`/carenote/participant/${clientId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create client care note
  createCareNote: async (careNoteData: any) => {
    try {
      const response = await api.post('/carenote', careNoteData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default clientService;
