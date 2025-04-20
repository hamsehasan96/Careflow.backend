'use client';

import { useState, useEffect } from 'react';
import { useProvider } from '@/contexts/ProviderContext';

interface NDISBudget {
  participantId: string;
  participantName: string;
  totalBudget: number;
  usedBudget: number;
  remainingBudget: number;
  services: {
    id: string;
    name: string;
    budget: number;
    used: number;
    remaining: number;
  }[];
}

interface Claim {
  id: string;
  participantId: string;
  participantName: string;
  date: string;
  service: string;
  duration: number;
  amount: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  notes?: string;
}

export default function ClaimsPage() {
  const _provider = useProvider();
  const [budgets, setBudgets] = useState<NDISBudget[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [_selectedParticipant, _setSelectedParticipant] = useState<string>('');
  const [_dateRange, _setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBudgets();
    fetchClaims();
  }, [_selectedParticipant, _dateRange]);

  const fetchBudgets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // TODO: Replace with actual API call
      const mockBudgets: NDISBudget[] = [
        {
          participantId: '1',
          participantName: 'John Doe',
          totalBudget: 50000,
          usedBudget: 25000,
          remainingBudget: 25000,
          services: [
            {
              id: '1',
              name: 'Support Coordination',
              budget: 20000,
              used: 10000,
              remaining: 10000,
            },
            {
              id: '2',
              name: 'Therapeutic Supports',
              budget: 30000,
              used: 15000,
              remaining: 15000,
            },
          ],
        },
      ];
      setBudgets(mockBudgets);
    } catch (err) {
      setError('Failed to fetch budgets');
      console.error('Error fetching budgets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClaims = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // TODO: Replace with actual API call
      const mockClaims: Claim[] = [
        {
          id: '1',
          participantId: '1',
          participantName: 'John Doe',
          date: '2024-03-15',
          service: 'Support Coordination',
          duration: 2,
          amount: 200,
          status: 'submitted',
          notes: 'Monthly support coordination session',
        },
      ];
      setClaims(mockClaims);
    } catch (err) {
      setError('Failed to fetch claims');
      console.error('Error fetching claims:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      // TODO: Implement export functionality
      console.log('Exporting claims in', format);
    } catch (err) {
      setError('Failed to export claims');
      console.error('Error exporting claims:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">NDIS Claims Management</h1>
        <div className="space-x-4">
          <button
            onClick={() => handleExport('csv')}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Export CSV
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Export PDF
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Budget Summary */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Budget Summary</h2>
          <div className="space-y-4">
            {budgets.map((budget) => (
              <div key={budget.participantId} className="border rounded-lg p-4">
                <h3 className="font-medium">{budget.participantName}</h3>
                <div className="mt-2">
                  <div className="flex justify-between">
                    <span>Total Budget:</span>
                    <span>${budget.totalBudget.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Used Budget:</span>
                    <span>${budget.usedBudget.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Remaining Budget:</span>
                    <span>${budget.remainingBudget.toLocaleString()}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Services</h4>
                  {budget.services.map((service) => (
                    <div key={service.id} className="ml-4 mb-2">
                      <div className="flex justify-between">
                        <span>{service.name}:</span>
                        <span>${service.remaining.toLocaleString()} remaining</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{
                            width: `${(service.used / service.budget) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Claims List */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Claims</h2>
          <div className="space-y-4">
            {claims.map((claim) => (
              <div
                key={claim.id}
                className="border rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{claim.participantName}</h3>
                    <p className="text-sm text-gray-500">{claim.date}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      claim.status === 'submitted'
                        ? 'bg-yellow-100 text-yellow-800'
                        : claim.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {claim.status}
                  </span>
                </div>
                <div className="mt-2">
                  <p>
                    <span className="font-medium">Service:</span> {claim.service}
                  </p>
                  <p>
                    <span className="font-medium">Duration:</span> {claim.duration}{' '}
                    hours
                  </p>
                  <p>
                    <span className="font-medium">Amount:</span> $
                    {claim.amount.toLocaleString()}
                  </p>
                  {claim.notes && (
                    <p className="mt-2 text-sm text-gray-600">{claim.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 