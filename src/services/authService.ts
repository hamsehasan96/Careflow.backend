import { LoginCredentials } from '@/types/auth';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'support_worker' | 'participant';
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<User> {
    // TODO: Replace with actual API call
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    return response.json();
  },

  async logout(): Promise<void> {
    // TODO: Replace with actual API call
    await fetch('/api/auth/logout', {
      method: 'POST',
    });
  },
}; 