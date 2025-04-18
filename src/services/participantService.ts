import { api } from './api';

export interface Participant {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export const participantService = {
  async getParticipants(): Promise<Participant[]> {
    const response = await api.get('/api/participants');
    return response.data;
  }
}; 