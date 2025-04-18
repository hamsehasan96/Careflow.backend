export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  isRead: boolean;
  createdAt: string;
  participantId?: string;
  appointmentId?: string;
}

export interface NewMessage {
  content: string;
  senderId: string;
  recipientId: string;
  participantId?: string;
  appointmentId?: string;
}

export interface MessageFilters {
  participantId?: string;
  isRead?: boolean;
  startDate?: string;
  endDate?: string;
} 