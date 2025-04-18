import { api } from './api';

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  userName: string;
  entityType: string;
  entityId: string;
  details: Record<string, any>;
  createdAt: string;
}

export interface AuditLogFilters {
  action?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export const auditService = {
  async getLogs(filters?: AuditLogFilters): Promise<AuditLog[]> {
    const response = await api.get('/api/audit-logs', { params: filters });
    return response.data;
  }
}; 