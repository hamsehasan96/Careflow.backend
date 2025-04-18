import { api } from './api';
import { Message, MessageFilters, NewMessage } from '@/types/message';

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  participantId?: string;
  appointmentId?: string;
  isRead: boolean;
  createdAt: string;
  parentId?: string; // For threaded conversations
  replies?: Message[]; // Nested replies
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  type: string;
}

export interface MessageFilters {
  participantId?: string;
  isRead?: boolean;
  parentId?: string; // For fetching thread replies
}

export const messageService = {
  async getMessages(filters: MessageFilters): Promise<Message[]> {
    // TODO: Implement actual API call
    return [];
  },

  async getThread(messageId: string): Promise<Message> {
    const response = await api.get(`/messages/${messageId}/thread`);
    return response.data;
  },

  async sendMessage(message: NewMessage): Promise<Message> {
    // TODO: Implement actual API call
    return {
      id: '1',
      content: message.content,
      senderId: message.senderId,
      recipientId: message.recipientId,
      status: 'unread',
      createdAt: new Date().toISOString(),
    };
  },

  async markAsRead(messageId: string): Promise<void> {
    // TODO: Implement actual API call
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