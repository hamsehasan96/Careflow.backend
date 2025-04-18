'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/api/auth';
import { getCookie } from 'cookies-next';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = getCookie('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const user = await authService.getCurrentUser();
        const userRole = getCookie('userRole');
        
        if (!userRole || user.role !== userRole) {
          // Update user role cookie if it doesn't match
          setCookie('userRole', user.role, { path: '/' });
        }

        // Redirect to role-specific dashboard if on generic dashboard
        if (window.location.pathname === '/dashboard') {
          switch (user.role) {
            case 'admin':
              router.push('/dashboard/admin');
              break;
            case 'support_worker':
              router.push('/dashboard/support');
              break;
            case 'participant':
              router.push('/dashboard/participant');
              break;
          }
        }
      } catch (error) {
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-indigo-600">CareFlow</h1>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => {
                  authService.logout();
                  router.push('/auth/login');
                }}
                className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
} 