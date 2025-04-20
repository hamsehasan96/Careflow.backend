'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Plus, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addHours } from 'date-fns';

// Sample data for appointments
const sampleAppointments = [
  {
    id: 1,
    title: 'Therapy Session - John Smith',
    start: new Date(2025, 3, 6, 10, 0),
    end: new Date(2025, 3, 6, 11, 0),
    resourceId: 'staff-1',
    status: 'confirmed',
    clientId: 'client-1',
    staffId: 'staff-1',
    serviceType: 'Therapy',
  },
  {
    id: 2,
    title: 'Home Visit - Sarah Johnson',
    start: new Date(2025, 3, 6, 14, 0),
    end: new Date(2025, 3, 6, 15, 30),
    resourceId: 'staff-2',
    status: 'confirmed',
    clientId: 'client-2',
    staffId: 'staff-2',
    serviceType: 'Home Visit',
  },
  {
    id: 3,
    title: 'Assessment - Michael Brown',
    start: new Date(2025, 3, 7, 9, 0),
    end: new Date(2025, 3, 7, 10, 30),
    resourceId: 'staff-1',
    status: 'pending',
    clientId: 'client-3',
    staffId: 'staff-1',
    serviceType: 'Assessment',
  },
];

// Sample data for staff
const sampleStaff = [
  { id: 'staff-1', name: 'Dr. Emily Wilson', role: 'Therapist' },
  { id: 'staff-2', name: 'James Thompson', role: 'Support Worker' },
  { id: 'staff-3', name: 'Lisa Chen', role: 'Occupational Therapist' },
];

// Sample data for clients
const sampleClients = [
  { id: 'client-1', name: 'John Smith', ndisNumber: '123456789' },
  { id: 'client-2', name: 'Sarah Johnson', ndisNumber: '987654321' },
  { id: 'client-3', name: 'Michael Brown', ndisNumber: '456789123' },
];

// Sample data for service types
const serviceTypes = [
  'Therapy',
  'Home Visit',
  'Assessment',
  'Group Session',
  'Consultation',
];

// Define types for form data and events
interface AppointmentFormData {
  title: string;
  start: Date;
  end: Date;
  clientId: string;
  staffId: string;
  serviceType: string;
  notes: string;
  status: string;
}

interface AppointmentEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resourceId: string;
  status: string;
  clientId: string;
  staffId: string;
  serviceType: string;
  notes?: string;
}

interface FilterState {
  staff: string;
  client: string;
  serviceType: string;
  status: string;
}

export default function AppointmentsPage() {
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const [_appointments, _setAppointments] = useState(sampleAppointments);
  const [showModal, setShowModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentEvent | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    staff: '',
    client: '',
    serviceType: '',
    status: '',
  });

  // Form state for new appointment
  const [formData, setFormData] = useState<AppointmentFormData>({
    title: '',
    start: new Date(),
    end: addHours(new Date(), 1),
    clientId: '',
    staffId: '',
    serviceType: '',
    notes: '',
    status: 'pending',
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle date changes
  const handleDateChange = (name: string, value: Date) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  // Apply filters
  const filteredAppointments = sampleAppointments.filter((appointment) => {
    if (filters.staff && appointment.staffId !== filters.staff) return false;
    if (filters.client && appointment.clientId !== filters.client) return false;
    if (filters.serviceType && appointment.serviceType !== filters.serviceType)
      return false;
    if (filters.status && appointment.status !== filters.status) return false;
    return true;
  });

  // Handle appointment selection
  const handleSelectEvent = (event: AppointmentEvent) => {
    setSelectedAppointment(event);
    setShowModal(true);
    setFormData({
      title: event.title,
      start: event.start,
      end: event.end,
      clientId: event.clientId,
      staffId: event.staffId,
      serviceType: event.serviceType,
      notes: event.notes || '',
      status: event.status,
    });
  };

  // Handle slot selection for new appointment
  const _handleSelectSlot = (slot: Date) => {
    setSelectedAppointment(null);
    setShowModal(true);
    setFormData({
      title: '',
      start: slot,
      end: addHours(slot, 1),
      clientId: '',
      staffId: '',
      serviceType: '',
      notes: '',
      status: 'pending',
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Here you would typically make an API call to save the appointment
    console.log('Form submitted:', formData);
    setShowModal(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Appointments</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and schedule appointments for clients
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowFilterModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
            <button
              onClick={() => {
                setSelectedAppointment(null);
                setFormData({
                  title: '',
                  start: new Date(),
                  end: addHours(new Date(), 1),
                  clientId: '',
                  staffId: '',
                  serviceType: '',
                  notes: '',
                  status: 'pending',
                });
                setShowModal(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Appointment
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-2">
              <button
                onClick={() => setView('month')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  view === 'month'
                    ? 'bg-teal-100 text-teal-800'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setView('week')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  view === 'week'
                    ? 'bg-teal-100 text-teal-800'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setView('day')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  view === 'day'
                    ? 'bg-teal-100 text-teal-800'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Day
              </button>
              <button
                onClick={() => setView('agenda')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  view === 'agenda'
                    ? 'bg-teal-100 text-teal-800'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Agenda
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  const newDate = new Date(date);
                  if (view === 'month') {
                    newDate.setMonth(date.getMonth() - 1);
                  } else if (view === 'week') {
                    newDate.setDate(date.getDate() - 7);
                  } else if (view === 'day') {
                    newDate.setDate(date.getDate() - 1);
                  }
                  setDate(newDate);
                }}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h2 className="text-lg font-medium text-gray-900">
                {view === 'month' && format(date, 'MMMM yyyy')}
                {view === 'week' &&
                  `Week of ${format(date, 'MMM d, yyyy')}`}
                {view === 'day' && format(date, 'EEEE, MMMM d, yyyy')}
                {view === 'agenda' && 'Agenda View'}
              </h2>
              <button
                onClick={() => {
                  const newDate = new Date(date);
                  if (view === 'month') {
                    newDate.setMonth(date.getMonth() + 1);
                  } else if (view === 'week') {
                    newDate.setDate(date.getDate() + 7);
                  } else if (view === 'day') {
                    newDate.setDate(date.getDate() + 1);
                  }
                  setDate(newDate);
                }}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={() => setDate(new Date())}
                className="ml-2 px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Today
              </button>
            </div>
          </div>

          <div className="h-[600px] border rounded-md p-4">
            <div className="text-center py-20">
              <h3 className="text-lg font-medium text-gray-900">Calendar View</h3>
              <p className="mt-1 text-sm text-gray-500">
                Calendar component is disabled in this build for compatibility reasons.
              </p>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredAppointments.map((appointment) => (
                  <div 
                    key={appointment.id}
                    onClick={() => handleSelectEvent(appointment)}
                    className={`p-4 rounded-md shadow cursor-pointer ${
                      appointment.status === 'confirmed' ? 'bg-teal-50 border-l-4 border-teal-500' :
                      appointment.status === 'pending' ? 'bg-amber-50 border-l-4 border-amber-500' :
                      'bg-red-50 border-l-4 border-red-500'
                    }`}
                  >
                    <h4 className="font-medium text-gray-900">{appointment.title}</h4>
                    <p className="text-sm text-gray-500">
                      {format(appointment.start, 'MMM d, yyyy h:mm a')} - {format(appointment.end, 'h:mm a')}
                    </p>
                    <div className="mt-2 flex justify-between">
                      <span className="text-xs font-medium text-gray-500">
                        {sampleStaff.find(s => s.id === appointment.staffId)?.name}
                      </span>
                      <span className={`text-xs font-medium ${
                        appointment.status === 'confirmed' ? 'text-teal-700' :
                        appointment.status === 'pending' ? 'text-amber-700' :
                        'text-red-700'
                      }`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedAppointment ? 'Edit Appointment' : 'New Appointment'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="start"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="start"
                    id="start"
                    value={format(formData.start, "yyyy-MM-dd'T'HH:mm")}
                    onChange={(e) =>
                      handleDateChange('start', new Date(e.target.value))
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="end"
                    className="block text-sm font-medium text-gray-700"
                  >
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="end"
                    id="end"
                    value={format(formData.end, "yyyy-MM-dd'T'HH:mm")}
                    onChange={(e) =>
                      handleDateChange('end', new Date(e.target.value))
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="clientId"
                  className="block text-sm font-medium text-gray-700"
                >
                  Client
                </label>
                <select
                  name="clientId"
                  id="clientId"
                  value={formData.clientId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                  required
                >
                  <option value="">Select Client</option>
                  {sampleClients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="staffId"
                  className="block text-sm font-medium text-gray-700"
                >
                  Staff Member
                </label>
                <select
                  name="staffId"
                  id="staffId"
                  value={formData.staffId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                  required
                >
                  <option value="">Select Staff Member</option>
                  {sampleStaff.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name} ({staff.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="serviceType"
                  className="block text-sm font-medium text-gray-700"
                >
                  Service Type
                </label>
                <select
                  name="serviceType"
                  id="serviceType"
                  value={formData.serviceType}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                  required
                >
                  <option value="">Select Service Type</option>
                  {serviceTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700"
                >
                  Status
                </label>
                <select
                  name="status"
                  id="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700"
                >
                  Notes
                </label>
                <textarea
                  name="notes"
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  Cancel
                </button>
                {selectedAppointment && (
                  <button
                    type="button"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  {selectedAppointment ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Filter Appointments
              </h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label
                  htmlFor="staff"
                  className="block text-sm font-medium text-gray-700"
                >
                  Staff Member
                </label>
                <select
                  name="staff"
                  id="staff"
                  value={filters.staff}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                >
                  <option value="">All Staff</option>
                  {sampleStaff.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="client"
                  className="block text-sm font-medium text-gray-700"
                >
                  Client
                </label>
                <select
                  name="client"
                  id="client"
                  value={filters.client}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                >
                  <option value="">All Clients</option>
                  {sampleClients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="serviceType"
                  className="block text-sm font-medium text-gray-700"
                >
                  Service Type
                </label>
                <select
                  name="serviceType"
                  id="serviceType"
                  value={filters.serviceType}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                >
                  <option value="">All Service Types</option>
                  {serviceTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700"
                >
                  Status
                </label>
                <select
                  name="status"
                  id="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setFilters({
                      staff: '',
                      client: '',
                      serviceType: '',
                      status: '',
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setShowFilterModal(false)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
