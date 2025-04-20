'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (!user || user.role !== 'admin') {
          router.push('/auth/login');
          return;
        }
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data');
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-indigo-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-indigo-900">Users</h2>
          <p className="mt-2 text-indigo-700">Manage system users</p>
        </div>
        <div className="bg-indigo-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-indigo-900">Reports</h2>
          <p className="mt-2 text-indigo-700">View system reports</p>
        </div>
        <div className="bg-indigo-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-indigo-900">Settings</h2>
          <p className="mt-2 text-indigo-700">Configure system settings</p>
        </div>
      </div>
    </div>
  );
} 