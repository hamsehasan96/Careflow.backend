'use client';

export default function ParticipantDashboard() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Participant Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-indigo-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-indigo-900">My Appointments</h2>
          <p className="mt-2 text-indigo-700">View and manage your appointments</p>
        </div>
        <div className="bg-indigo-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-indigo-900">My Support Workers</h2>
          <p className="mt-2 text-indigo-700">View your assigned support workers</p>
        </div>
        <div className="bg-indigo-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-indigo-900">My Profile</h2>
          <p className="mt-2 text-indigo-700">Manage your personal information</p>
        </div>
      </div>
    </div>
  );
} 