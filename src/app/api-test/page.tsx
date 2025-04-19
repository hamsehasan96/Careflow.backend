'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function ApiTestPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        const response = await api.get('/health');
        setStatus('success');
        setMessage('Connected to backend successfully!');
        console.log('Backend response:', response.data);
      } catch (error) {
        setStatus('error');
        setMessage('Failed to connect to backend. Check console for details.');
        console.error('Backend connection error:', error);
      }
    };

    checkBackendConnection();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-900">
          Backend Connection Test
        </h1>
        
        <div className="mt-8">
          {status === 'loading' && (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          )}
          
          {status === 'success' && (
            <div className="bg-green-50 text-green-800 p-4 rounded-md">
              <p className="text-center">{message}</p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="bg-red-50 text-red-800 p-4 rounded-md">
              <p className="text-center">{message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 