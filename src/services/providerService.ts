import { api } from './api';

export interface Provider {
  id: string;
  name: string;
  ndisNumber: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export const providerService = {
  async getProvider(): Promise<Provider> {
    const response = await api.get('/api/providers/current');
    return response.data;
  },

  async getProviderUsers(providerId: string): Promise<any[]> {
    const response = await api.get(`/api/providers/${providerId}/users`);
    return response.data;
  },

  async getProviderParticipants(providerId: string): Promise<any[]> {
    const response = await api.get(`/api/providers/${providerId}/participants`);
    return response.data;
  }
}; 