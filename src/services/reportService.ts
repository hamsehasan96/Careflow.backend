import { api } from './api';

export interface MonthlySummary {
  month: string;
  appointmentsCompleted: number;
  newParticipants: number;
  activeSupportWorkers: number;
  careNotesCount: number;
}

export interface ParticipantStats {
  participantId: string;
  participantName: string;
  appointmentsCompleted: number;
  careNotesCount: number;
  totalHours: number;
}

export interface ProviderStats {
  totalParticipants: number;
  totalSupportWorkers: number;
  totalAppointments: number;
  totalCareNotes: number;
  monthlySummaries: MonthlySummary[];
  participantStats: ParticipantStats[];
}

export const reportService = {
  async getProviderStats(): Promise<ProviderStats> {
    const response = await api.get('/api/reports/provider-stats');
    return response.data;
  },

  async getParticipantStats(participantId: string): Promise<ParticipantStats> {
    const response = await api.get(`/api/reports/participant-stats/${participantId}`);
    return response.data;
  },

  async getMonthlySummary(startDate: string, endDate: string): Promise<MonthlySummary[]> {
    const response = await api.get('/api/reports/monthly-summary', {
      params: { startDate, endDate }
    });
    return response.data;
  }
}; 