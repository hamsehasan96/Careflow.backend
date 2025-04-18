import { api } from './api';
import { Message, MessageFilters, NewMessage } from '@/types/message';

export const messageService = {
  async getMessages(filters: MessageFilters): Promise<Message[]> {
    try {
      const response = await api.get('/messages', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  async getThread(messageId: string): Promise<Message> {
    const response = await api.get(`/messages/${messageId}/thread`);
    return response.data;
  },

  async sendMessage(message: NewMessage): Promise<Message> {
    try {
      const response = await api.post('/messages', message);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  async markAsRead(messageId: string): Promise<void> {
    try {
      await api.patch(`/messages/${messageId}/read`);
    } catch (error) {
      console.error('Error marking message as read:', error);
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