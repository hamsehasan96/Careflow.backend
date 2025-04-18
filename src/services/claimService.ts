import { api } from './api';

export interface NDISClaim {
  id: string;
  participantId: string;
  participantName: string;
  serviceType: string;
  dateOfService: string;
  hours: number;
  rate: number;
  totalAmount: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  createdAt: string;
}

export interface ClaimFilters {
  participantId?: string;
  startDate?: string;
  endDate?: string;
  status?: NDISClaim['status'];
  serviceType?: string;
}

export const claimService = {
  async getClaims(filters?: ClaimFilters): Promise<NDISClaim[]> {
    const response = await api.get('/api/claims', { params: filters });
    return response.data;
  },

  async createClaim(data: {
    participantId: string;
    serviceType: string;
    dateOfService: string;
    hours: number;
    rate: number;
  }): Promise<NDISClaim> {
    const response = await api.post('/api/claims', data);
    return response.data;
  },

  async updateClaimStatus(claimId: string, status: NDISClaim['status']): Promise<NDISClaim> {
    const response = await api.patch(`/api/claims/${claimId}/status`, { status });
    return response.data;
  },

  async exportClaims(filters?: ClaimFilters): Promise<Blob> {
    const response = await api.get('/api/claims/export', {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  }
}; 