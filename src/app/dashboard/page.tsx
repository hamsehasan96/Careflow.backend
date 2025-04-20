'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { BarChart, Calendar, Clock, Users } from 'lucide-react';
import dynamic from 'next/dynamic';

// Mock data for dashboard
const mockStats = [
  { name: 'Total Clients', value: '42', icon: Users, color: 'bg-blue-500' },
  { name: 'Upcoming Appointments', value: '12', icon: Calendar, color: 'bg-teal-500' },
  { name: 'Staff Members', value: '8', icon: Users, color: 'bg-indigo-500' },
  { name: 'Hours Scheduled', value: '156', icon: Clock, color: 'bg-purple-500' },
];

const mockAppointments = [
  { id: 1, client: 'John Smith', service: 'Physiotherapy', date: '2025-04-07', time: '09:00 AM', status: 'confirmed' },
  { id: 2, client: 'Sarah Johnson', service: 'Occupational Therapy', date: '2025-04-07', time: '11:30 AM', status: 'confirmed' },
  { id: 3, client: 'Michael Brown', service: 'Speech Therapy', date: '2025-04-08', time: '10:00 AM', status: 'pending' },
  { id: 4, client: 'Emily Davis', service: 'Support Coordination', date: '2025-04-08', time: '02:00 PM', status: 'confirmed' },
  { id: 5, client: 'David Wilson', service: 'Physiotherapy', date: '2025-04-09', time: '09:30 AM', status: 'confirmed' },
];

const _BarChart = dynamic(() => import('@/components/charts/BarChart'), { ssr: false });
const [_stats, _setStats] = useState<DashboardStats>({
  totalParticipants: 0,
  activeParticipants: 0,
  totalStaff: 0,
  activeStaff: 0,
  totalAppointments: 0,
  upcomingAppointments: 0
});
const [_appointments, _setAppointments] = useState<Appointment[]>([]);

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(mockStats);
  const [appointments, setAppointments] = useState(mockAppointments);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome to CareFlow. Here's an overview of your service.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
            >
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-md`}>
                  <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500 truncate">{stat.name}</p>
                  <p className="mt-1 text-3xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Appointments */}
        <div className="overflow-hidden bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Upcoming Appointments</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Your schedule for the next few days.</p>
            </div>
            <button className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="border-t border-gray-200">
            {isLoading ? (
              <div className="px-4 py-12 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-600 border-r-transparent"></div>
                <p className="mt-4 text-gray-500">Loading appointments...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {appointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{appointment.client}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{appointment.service}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{appointment.date}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{appointment.time}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            appointment.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-teal-600 hover:text-teal-900 mr-4">View</button>
                          <button className="text-teal-600 hover:text-teal-900">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Subscription Info */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Subscription Plan</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>You are currently on the Growth plan ($149/month).</p>
            </div>
            <div className="mt-3 text-sm">
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                  15 staff users
                </span>
                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                  50 participants
                </span>
                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                  NDIS invoicing
                </span>
              </div>
            </div>
            <div className="mt-5">
              <button
                type="button"
                className="inline-flex items-center rounded-md bg-teal-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
              >
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
