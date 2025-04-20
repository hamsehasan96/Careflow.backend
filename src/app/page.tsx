'use client';

// Deployment trigger comment
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/authService';
import { HeartPulse } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          setIsAuthenticated(true);
          // Redirect based on role
          switch (user.role) {
            case 'admin':
              router.push('/dashboard/admin');
              break;
            case 'support':
              router.push('/dashboard/support');
              break;
            case 'participant':
              router.push('/dashboard/participant');
              break;
            default:
              router.push('/dashboard');
          }
        }
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
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

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <HeartPulse className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">CareFlow</h1>
          </div>
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            Your comprehensive care and support management solution
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Streamline your NDIS service delivery with our integrated platform
          </p>
        </div>

        {/* Auth Buttons */}
        <div className="flex justify-center space-x-4 mb-12">
          <Link
            href="/auth/login"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Provider Account
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">NDIS Compliance</h3>
            <p className="text-gray-600">
              Stay compliant with NDIS requirements and streamline your reporting process
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Messaging</h3>
            <p className="text-gray-600">
              Communicate securely with participants and team members
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Automated Invoicing</h3>
            <p className="text-gray-600">
              Generate and manage invoices automatically based on service delivery
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
