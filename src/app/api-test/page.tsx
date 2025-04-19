'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { authService } from '@/services/authService';

interface TestResult {
  endpoint: string;
  status: 'success' | 'error' | 'loading';
  message: string;
}

export default function ApiTestPage() {
  const router = useRouter();
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  const runTests = async () => {
    setIsRunningTests(true);
    setResults([]);

    // Test health endpoint
    try {
      const response = await api.get('/health');
      addResult({
        endpoint: '/health',
        status: 'success',
        message: 'Backend health check successful'
      });
    } catch (error) {
      addResult({
        endpoint: '/health',
        status: 'error',
        message: 'Backend health check failed'
      });
    }

    // Test authentication
    try {
      const testUser = {
        email: 'test@example.com',
        password: 'testpassword123'
      };

      // Test registration
      try {
        const registerResponse = await authService.register({
          providerName: 'Test Provider',
          admin: {
            name: 'Test Admin',
            email: testUser.email,
            password: testUser.password
          }
        });
        addResult({
          endpoint: '/providers/register',
          status: 'success',
          message: 'Registration successful'
        });
      } catch (error: any) {
        // If registration fails due to existing user, that's okay
        if (error?.response?.status !== 409) {
          throw error;
        }
      }

      // Test login
      const loginResponse = await authService.login(testUser);
      addResult({
        endpoint: '/auth/login',
        status: 'success',
        message: 'Login successful'
      });

      // Test protected endpoint
      const meResponse = await authService.getCurrentUser();
      addResult({
        endpoint: '/auth/me',
        status: 'success',
        message: 'Protected endpoint access successful'
      });

      // Test logout
      await authService.logout();
      addResult({
        endpoint: '/auth/logout',
        status: 'success',
        message: 'Logout successful'
      });

    } catch (error) {
      console.error('Auth flow error:', error);
      addResult({
        endpoint: '/auth/*',
        status: 'error',
        message: 'Authentication flow failed'
      });
    }

    setIsRunningTests(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
              API Integration Tests
            </h1>

            <div className="mb-8">
              <button
                onClick={runTests}
                disabled={isRunningTests}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isRunningTests ? 'Running Tests...' : 'Run Tests'}
              </button>
            </div>

            <div className="space-y-4">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`rounded-md p-4 ${
                    result.status === 'success'
                      ? 'bg-green-50'
                      : result.status === 'error'
                      ? 'bg-red-50'
                      : 'bg-yellow-50'
                  }`}
                >
                  <div className="flex">
                    <div className="flex-shrink-0">
                      {result.status === 'success' ? (
                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : result.status === 'error' ? (
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3">
                      <h3 className={`text-sm font-medium ${
                        result.status === 'success'
                          ? 'text-green-800'
                          : result.status === 'error'
                          ? 'text-red-800'
                          : 'text-yellow-800'
                      }`}>
                        {result.endpoint}
                      </h3>
                      <div className={`mt-2 text-sm ${
                        result.status === 'success'
                          ? 'text-green-700'
                          : result.status === 'error'
                          ? 'text-red-700'
                          : 'text-yellow-700'
                      }`}>
                        <p>{result.message}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 