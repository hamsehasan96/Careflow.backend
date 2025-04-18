'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api/client';

interface Appointment {
  id: string;
  participant: {
    id: string;
    name: string;
  };
  supportWorker: {
    id: string;
    name: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newAppointment, setNewAppointment] = useState({
    participantId: '',
    supportWorkerId: '',
    date: '',
    startTime: '',
    endTime: '',
    notes: '',
  });
  const [participants, setParticipants] = useState<Array<{ id: string; name: string }>>([]);
  const [supportWorkers, setSupportWorkers] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    fetchAppointments();
    fetchParticipants();
    fetchSupportWorkers();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await apiClient.get('/appointments');
      setAppointments(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async () => {
    try {
      const response = await apiClient.get('/participants');
      setParticipants(response.data);
    } catch (err) {
      setError('Failed to load participants');
    }
  };

  const fetchSupportWorkers = async () => {
    try {
      const response = await apiClient.get('/users?role=support_worker');
      setSupportWorkers(response.data);
    } catch (err) {
      setError('Failed to load support workers');
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/appointments', newAppointment);
      setNewAppointment({
        participantId: '',
        supportWorkerId: '',
        date: '',
        startTime: '',
        endTime: '',
        notes: '',
      });
      fetchAppointments();
    } catch (err) {
      setError('Failed to create appointment');
    }
  };

  const handleUpdateAppointment = async (appointmentId: string, updates: Partial<Appointment>) => {
    try {
      await apiClient.put(`/appointments/${appointmentId}`, updates);
      fetchAppointments();
    } catch (err) {
      setError('Failed to update appointment');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Appointments Management</h1>
        <button
          onClick={() => document.getElementById('createAppointmentModal')?.showModal()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Schedule Appointment
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Participant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Support Worker
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>{new Date(appointment.date).toLocaleDateString()}</div>
                  <div className="text-sm text-gray-500">
                    {appointment.startTime} - {appointment.endTime}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{appointment.participant.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{appointment.supportWorker.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      appointment.status === 'scheduled'
                        ? 'bg-blue-100 text-blue-800'
                        : appointment.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {appointment.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleUpdateAppointment(appointment.id, { status: 'completed' })}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                    disabled={appointment.status !== 'scheduled'}
                  >
                    Mark Complete
                  </button>
                  <button
                    onClick={() => handleUpdateAppointment(appointment.id, { status: 'cancelled' })}
                    className="text-red-600 hover:text-red-900"
                    disabled={appointment.status !== 'scheduled'}
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dialog id="createAppointmentModal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Schedule New Appointment</h3>
          <form onSubmit={handleCreateAppointment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Participant</label>
              <select
                value={newAppointment.participantId}
                onChange={(e) => setNewAppointment({ ...newAppointment, participantId: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="">Select Participant</option>
                {participants.map((participant) => (
                  <option key={participant.id} value={participant.id}>
                    {participant.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Support Worker</label>
              <select
                value={newAppointment.supportWorkerId}
                onChange={(e) => setNewAppointment({ ...newAppointment, supportWorkerId: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="">Select Support Worker</option>
                {supportWorkers.map((worker) => (
                  <option key={worker.id} value={worker.id}>
                    {worker.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                value={newAppointment.date}
                onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                <input
                  type="time"
                  value={newAppointment.startTime}
                  onChange={(e) => setNewAppointment({ ...newAppointment, startTime: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Time</label>
                <input
                  type="time"
                  value={newAppointment.endTime}
                  onChange={(e) => setNewAppointment({ ...newAppointment, endTime: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={newAppointment.notes}
                onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows={3}
              />
            </div>
            <div className="modal-action">
              <button type="submit" className="btn btn-primary">
                Schedule Appointment
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => document.getElementById('createAppointmentModal')?.close()}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
} 