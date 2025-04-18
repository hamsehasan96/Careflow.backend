import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'support_worker' | 'participant';
  }

  interface Session {
    user: User;
  }
} 