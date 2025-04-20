'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, FileText, Calendar } from 'lucide-react';
import Link from 'next/link';

// Mock data for staff members
const mockStaff = [
  { 
    id: 1, 
    name: 'Dr. Michael Lee', 
    email: 'michael.lee@careflow.com', 
    phone: '0412 345 678', 
    role: 'Physiotherapist',
    status: 'active',
    joinDate: '2024-01-15',
    clients: 12,
    appointments: 28
  },
  { 
    id: 2, 
    name: 'Emma Wilson', 
    email: 'emma.wilson@careflow.com', 
    phone: '0423 456 789', 
    role: 'Occupational Therapist',
    status: 'active',
    joinDate: '2024-02-10',
    clients: 8,
    appointments: 16
  },
  { 
    id: 3, 
    name: 'Robert Johnson', 
    email: 'robert.johnson@careflow.com', 
    phone: '0434 567 890', 
    role: 'Support Coordinator',
    status: 'active',
    joinDate: '2024-01-05',
    clients: 15,
    appointments: 22
  },
  { 
    id: 4, 
    name: 'Jessica Taylor', 
    email: 'jessica.taylor@careflow.com', 
    phone: '0445 678 901', 
    role: 'Speech Therapist',
    status: 'inactive',
    joinDate: '2024-03-01',
    clients: 6,
    appointments: 10
  },
  { 
    id: 5, 
    name: 'David Wilson', 
    email: 'david.wilson@careflow.com', 
    phone: '0456 789 012', 
    role: 'Administrator',
    status: 'active',
    joinDate: '2023-12-01',
    clients: 0,
    appointments: 0
  },
];

// Mock data for roles
const mockRoles = [
  { id: 1, name: 'All Roles' },
  { id: 2, name: 'Physiotherapist' },
  { id: 3, name: 'Occupational Therapist' },
  { id: 4, name: 'Speech Therapist' },
  { id: 5, name: 'Support Coordinator' },
  { id: 6, name: 'Administrator' },
];

export default function StaffPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [_staff, _setStaff] = useState(mockStaff);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState(1); // Default to "All Roles"
  const [statusFilter, setStatusFilter] = useState('all');
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Filter staff based on search term, role, and status
  const filteredStaff = mockStaff.filter(staffMember => {
    const matchesSearch = staffMember.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         staffMember.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staffMember.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 1 || staffMember.role === mockRoles.find(r => r.id === roleFilter)?.name;
    const matchesStatus = statusFilter === 'all' || staffMember.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(Number(e.target.value));
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const toggleDropdown = (staffId: number) => {
    if (dropdownOpen === staffId) {
      setDropdownOpen(null);
    } else {
      setDropdownOpen(staffId);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Staff</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your staff members and their roles.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              type="button"
              onClick={() => setShowAddStaffModal(true)}
              className="inline-flex items-center rounded-md bg-teal-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
            >
              <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
              Add Staff
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
                placeholder="Search staff"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-4">
              <div className="flex items-center">
                <Filter className="mr-2 h-5 w-5 text-gray-400" aria-hidden="true" />
                <select
                  id="role"
                  name="role"
                  className="block rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-teal-600 sm:text-sm sm:leading-6"
                  value={roleFilter}
                  onChange={handleRoleFilterChange}
                >
                  {mockRoles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center">
                <select
                  id="status"
                  name="status"
                  className="block rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-teal-600 sm:text-sm sm:leading-6"
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
        </div>

        {/* Staff List */}
        <div className="overflow-hidden bg-white shadow sm:rounded-lg">
          {isLoading ? (
            <div className="px-4 py-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-500">Loading staff...</p>
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
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Clients
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStaff.length > 0 ? (
                    filteredStaff.map((staffMember) => (
                      <tr key={staffMember.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{staffMember.name}</div>
                          <div className="text-xs text-gray-500">Since {staffMember.joinDate}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{staffMember.email}</div>
                          <div className="text-sm text-gray-500">{staffMember.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{staffMember.role}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            staffMember.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {staffMember.status.charAt(0).toUpperCase() + staffMember.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{staffMember.clients} clients</div>
                          <div className="text-xs text-gray-500">{staffMember.appointments} appointments</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="relative">
                            <button
                              onClick={() => toggleDropdown(staffMember.id)}
                              className="text-gray-400 hover:text-gray-500"
                            >
                              <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
                            </button>
                            {dropdownOpen === staffMember.id && (
                              <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <Link
                                  href={`/staff/${staffMember.id}`}
                                  className="flex px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <FileText className="mr-2 h-4 w-4" />
                                  View Profile
                                </Link>
                                <Link
                                  href={`/staff/${staffMember.id}/calendar`}
                                  className="flex px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Calendar className="mr-2 h-4 w-4" />
                                  View Calendar
                                </Link>
                                <Link
                                  href={`/staff/${staffMember.id}/edit`}
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
                        No staff members found matching your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowAddStaffModal(false)}></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Add New Staff Member
                  </h3>
                  <div className="mt-4">
                    <form className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                          placeholder="Enter full name"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                          placeholder="Enter email address"
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          id="phone"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                          Role
                        </label>
                        <select
                          id="role"
                          name="role"
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
                        >
                          <option value="">Select a role</option>
                          <option value="Physiotherapist">Physiotherapist</option>
                          <option value="Occupational Therapist">Occupational Therapist</option>
                          <option value="Speech Therapist">Speech Therapist</option>
                          <option value="Support Coordinator">Support Coordinator</option>
                          <option value="Administrator">Administrator</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                          Temporary Password
                        </label>
                        <input
                          type="password"
                          name="password"
                          id="password"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                          placeholder="Enter temporary password"
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          id="send-invite"
                          name="send-invite"
                          type="checkbox"
                          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                        />
                        <label htmlFor="send-invite" className="ml-2 block text-sm text-gray-900">
                          Send email invitation
                        </label>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    // Handle add staff
                    setShowAddStaffModal(false);
                  }}
                >
                  Add Staff Member
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => setShowAddStaffModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
