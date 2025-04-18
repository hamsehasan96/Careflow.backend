import { api } from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'support_worker' | 'participant';
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
}

export interface InviteUserData {
  name: string;
  email: string;
  role: User['role'];
}

export const userService = {
  async getUsers(): Promise<User[]> {
    const response = await api.get('/api/users');
    return response.data;
  },

  async inviteUser(data: InviteUserData): Promise<User> {
    const response = await api.post('/api/users/invite', data);
    return response.data;
  },

  async updateUserRole(userId: string, role: User['role']): Promise<User> {
    const response = await api.patch(`/api/users/${userId}/role`, { role });
    return response.data;
  },

  async deactivateUser(userId: string): Promise<User> {
    const response = await api.patch(`/api/users/${userId}/status`, { status: 'inactive' });
    return response.data;
  },

  async resetPassword(userId: string): Promise<void> {
    await api.post(`/api/users/${userId}/reset-password`);
  }
}; 