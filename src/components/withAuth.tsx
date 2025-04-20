'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authService } from '@/services/authService';

interface WithAuthProps {
  allowedRoles?: string[];
  redirectTo?: string;
}

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  { allowedRoles, redirectTo = '/auth/login' }: WithAuthProps = {}
) {
  return function WithAuthWrapper(props: P) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
      const checkAuth = async () => {
        try {
          const user = await authService.getCurrentUser();
          
          if (!user) {
            router.push(redirectTo);
            return;
          }

          if (allowedRoles && !allowedRoles.includes(user.role)) {
            // Redirect based on role
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
              default:
                router.push(redirectTo);
            }
            return;
          }

          setIsAuthorized(true);
        } catch (error) {
          console.error('Auth check failed:', error);
          router.push(redirectTo);
        } finally {
          setIsLoading(false);
        }
      };

      checkAuth();
    }, [checkAuth]);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      );
    }

    if (!isAuthorized) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
} 