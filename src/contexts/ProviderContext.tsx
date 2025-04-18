'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/authService';

interface Provider {
  id: string;
  name: string;
  logo?: string;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  settings: {
    messagingEnabled: boolean;
    ndisComplianceDocs: string[];
  };
}

interface ProviderContextType {
  provider: Provider | null;
  isLoading: boolean;
  error: string | null;
  updateProvider: (data: Partial<Provider>) => Promise<void>;
}

const ProviderContext = createContext<ProviderContextType | undefined>(undefined);

export function ProviderProvider({ children }: { children: React.ReactNode }) {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProvider();
  }, []);

  const fetchProvider = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // TODO: Replace with actual API call
      const mockProvider: Provider = {
        id: '1',
        name: 'CareFlow Provider',
        contactInfo: {
          email: 'contact@careflow.com',
          phone: '+61 2 1234 5678',
          address: '123 Provider St, Sydney NSW 2000',
        },
        settings: {
          messagingEnabled: true,
          ndisComplianceDocs: ['terms.pdf', 'consent.pdf'],
        },
      };
      setProvider(mockProvider);
    } catch (err) {
      setError('Failed to load provider information');
      console.error('Error fetching provider:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProvider = async (data: Partial<Provider>) => {
    try {
      setError(null);
      // TODO: Replace with actual API call
      setProvider((prev) => prev ? { ...prev, ...data } : null);
    } catch (err) {
      setError('Failed to update provider information');
      console.error('Error updating provider:', err);
      throw err;
    }
  };

  return (
    <ProviderContext.Provider
      value={{
        provider,
        isLoading,
        error,
        updateProvider,
      }}
    >
      {children}
    </ProviderContext.Provider>
  );
}

export function useProvider() {
  const context = useContext(ProviderContext);
  if (context === undefined) {
    throw new Error('useProvider must be used within a ProviderProvider');
  }
  return context;
} 