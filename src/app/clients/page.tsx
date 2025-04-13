'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, FileText } from 'lucide-react';
import Link from 'next/link';

// Mock data for clients
const mockClients = [
  { 
    id: 1, 
    name: 'John Smith', 
    email: 'john.smith@example.com', 
    phone: '0412 345 678', 
    ndisNumber: '123456789', 
    status: 'active',
    lastAppointment: '2025-03-28',
    nextAppointment: '2025-04-10'
  },
  { 
    id: 2, 
    name: 'Sarah Johnson', 
    email: 'sarah.j@example.com', 
    phone: '0423 456 789', 
    ndisNumber: '234567890', 
    status: 'active',
    lastAppointment: '2025-04-01',
    nextAppointment: '2025-04-15'
  },
  { 
    id: 3, 
    name: 'Michael Brown', 
    email: 'michael.b@example.com', 
    phone: '0434 567 890', 
    ndisNumber: '345678901', 
    status: 'inactive',
    lastAppointment: '2025-02-15',
    nextAppointment: null
  },
  { 
    id: 4, 
    name: 'Emily Davis', 
    email: 'emily.d@example.com', 
    phone: '0445 678 901', 
    ndisNumber: '456789012', 
    status: 'active',
    lastAppointment: '2025-04-03',
    nextAppointment: '2025-04-17'
  },
  { 
    id: 5, 
    name: 'David Wilson', 
    email: 'david.w@example.com', 
    phone: '0456 789 012', 
    ndisNumber: '567890123', 
    status: 'active',
    lastAppointment: '2025-03-25',
    nextAppointment: '2025-04-08'
  },
];

export default function ClientsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [clients, setClients] = useState(mockClients);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Filter clients based on search term and status filter
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.ndisNumber.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const toggleDropdown = (clientId: number) => {
    if (dropdownOpen === clientId) {
      setDropdownOpen(null);
    } else {
      setDropdownOpen(clientId);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your client information and records.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-teal-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
            >
              <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
              Add Client
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 shadow sm:rounded-lg">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="relative mt-2 rounded-md shadow-sm max-w-xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
                placeholder="Search clients"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <div className="mt-4 sm:mt-0 flex items-center">
              <Filter className="mr-2 h-5 w-5 text-gray-400" aria-hidden="true" />
              <select
                id="status"
                name="status"
                className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-teal-600 sm:text-sm sm:leading-6"
                value={statusFilter}
                onChange={handleStatusFilterChange}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Client List */}
        <div className="overflow-hidden bg-white shadow sm:rounded-lg">
          {isLoading ? (
            <div className="px-4 py-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-500">Loading clients...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NDIS Number
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Next Appointment
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredClients.length > 0 ? (
                    filteredClients.map((client) => (
                      <tr key={client.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{client.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{client.email}</div>
                          <div className="text-sm text-gray-500">{client.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{client.ndisNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            client.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {client.nextAppointment ? client.nextAppointment : 'No upcoming appointments'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="relative">
                            <button
                              onClick={() => toggleDropdown(client.id)}
                              className="text-gray-400 hover:text-gray-500"
                            >
                              <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
                            </button>
                            {dropdownOpen === client.id && (
                              <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <Link
                                  href={`/clients/${client.id}`}
                                  className="flex px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <FileText className="mr-2 h-4 w-4" />
                                  View Details
                                </Link>
                                <Link
                                  href={`/clients/${client.id}/edit`}
                                  className="flex px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                                <button
                                  className="flex w-full px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                        No clients found matching your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
