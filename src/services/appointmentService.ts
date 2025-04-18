import { api } from './api';

export interface Appointment {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  participantId: string;
  supportWorkerId: string;
}

export const appointmentService = {
  async getAppointments(): Promise<Appointment[]> {
    const response = await api.get('/api/appointments');
    return response.data;
  }
}; 