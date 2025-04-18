'use client';

import { useEffect, useState } from 'react';
import { auditService, AuditLog, AuditLogFilters } from '@/services/auditService';

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AuditLogFilters>({});

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const fetchLogs = async () => {
    try {
      const data = await auditService.getLogs(filters);
      setLogs(data);
    } catch (err) {
      setError('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof AuditLogFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Audit Logs</h1>

      <div className="mb-4 flex space-x-4">
        <div>
          <label htmlFor="action" className="block text-sm font-medium text-gray-700">
            Action
          </label>
          <input
            type="text"
            id="action"
            value={filters.action || ''}
            onChange={(e) => handleFilterChange('action', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
            User ID
          </label>
          <input
            type="text"
            id="userId"
            value={filters.userId || ''}
            onChange={(e) => handleFilterChange('userId', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={filters.startDate || ''}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            value={filters.endDate || ''}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entity
              </th>
              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                  {log.action}
                </td>
                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                  {log.userName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                  {log.entityType}
                </td>
                <td className="px-6 py-4 border-b border-gray-200">
                  <pre className="text-xs bg-gray-50 p-2 rounded">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                </td>
                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 