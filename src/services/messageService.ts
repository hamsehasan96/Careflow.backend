import { api } from './api';
import { Message, MessageFilters, NewMessage } from '@/types/message';
import { useProvider } from '@/contexts/ProviderContext';

export interface MessageSearchParams {
  keyword?: string;
  participantId?: string;
  startDate?: string;
  endDate?: string;
  tags?: string[];
}

export interface MessageExportParams {
  startDate: string;
  endDate: string;
  format: 'csv' | 'json';
}

export const messageService = {
  async getMessages(filters: MessageFilters): Promise<Message[]> {
    try {
      const response = await api.get('/messages', { 
        params: {
          ...filters,
          providerId: localStorage.getItem('providerId'),
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  async searchMessages(params: MessageSearchParams): Promise<Message[]> {
    try {
      const response = await api.get('/messages/search', {
        params: {
          ...params,
          providerId: localStorage.getItem('providerId'),
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching messages:', error);
      throw error;
    }
  },

  async getThread(messageId: string): Promise<Message> {
    const response = await api.get(`/messages/${messageId}/thread`);
    return response.data;
  },

  async sendMessage(message: NewMessage): Promise<Message> {
    try {
      const response = await api.post('/messages', {
        ...message,
        providerId: localStorage.getItem('providerId'),
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  async markAsRead(messageId: string): Promise<void> {
    try {
      await api.patch(`/messages/${messageId}/read`, {
        providerId: localStorage.getItem('providerId'),
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  },

  async addTag(messageId: string, tag: string): Promise<void> {
    try {
      await api.post(`/messages/${messageId}/tags`, {
        tag,
        providerId: localStorage.getItem('providerId'),
      });
    } catch (error) {
      console.error('Error adding tag:', error);
      throw error;
    }
  },

  async removeTag(messageId: string, tag: string): Promise<void> {
    try {
      await api.delete(`/messages/${messageId}/tags/${tag}`, {
        params: {
          providerId: localStorage.getItem('providerId'),
        }
      });
    } catch (error) {
      console.error('Error removing tag:', error);
      throw error;
    }
  },

  async exportMessages(params: MessageExportParams): Promise<Blob> {
    try {
      const response = await api.get('/messages/export', {
        params: {
          ...params,
          providerId: localStorage.getItem('providerId'),
        },
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting messages:', error);
      throw error;
    }
  },

  async deleteMessage(messageId: string): Promise<void> {
    await api.delete(`/messages/${messageId}`);
  },

  async deleteAttachment(messageId: string, attachmentId: string): Promise<void> {
    await api.delete(`/messages/${messageId}/attachments/${attachmentId}`);
  },

  // WebSocket connection for real-time updates
  connectWebSocket(onMessage: (message: Message) => void): WebSocket {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001');
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      onMessage(message);
    };

    return ws;
  }
}; 