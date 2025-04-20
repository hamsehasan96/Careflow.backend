'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import ProtectedRoute from '@/components/ProtectedRoute';

interface AppointmentsLayoutProps {
  children: React.ReactNode;
}

export default function AppointmentsLayout({ children }: AppointmentsLayoutProps) {
  const router = useRouter();

  useEffect(() => {
    const checkPermissions = async () => {
      const user = await authService.getCurrentUser();
      if (!user || !['admin', 'provider'].includes(user.role)) {
        router.push('/dashboard');
      }
    };

    checkPermissions();
  }, [router]);

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </ProtectedRoute>
  );
} 