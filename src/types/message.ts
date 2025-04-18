export interface Message {
  id: string;
  content: string;
  senderId: string;
  recipientId: string;
  status: 'read' | 'unread';
  createdAt: string;
}

export interface NewMessage {
  content: string;
  senderId: string;
  recipientId: string;
}

export interface MessageFilters {
  participantId?: string;
  status?: 'read' | 'unread';
  startDate?: string;
  endDate?: string;
} 