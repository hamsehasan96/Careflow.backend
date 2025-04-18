import { api } from './api';

export interface CareNote {
  id: string;
  content: string;
  participantId: string;
  supportWorkerId: string;
  createdAt: string;
}

export const noteService = {
  async createNote(content: string, participantId: string): Promise<CareNote> {
    const response = await api.post('/api/notes', {
      content,
      participantId
    });
    return response.data;
  }
}; 