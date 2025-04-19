import api from '@/lib/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  providerId: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const response = await api.post('/auth/login', credentials);
    const { user, token } = response.data;
    localStorage.setItem('token', token);
    return { user, token };
  }

  async register(data: {
    providerName: string;
    admin: {
      name: string;
      email: string;
      password: string;
    };
  }): Promise<{ user: User; token: string }> {
    const response = await api.post('/providers/register', data);
    const { user, token } = response.data;
    localStorage.setItem('token', token);
    return { user, token };
  }

  async logout(): Promise<void> {
    localStorage.removeItem('token');
    await api.post('/auth/logout');
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}

export const authService = new AuthService(); 