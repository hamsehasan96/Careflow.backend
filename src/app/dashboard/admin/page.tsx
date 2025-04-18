'use client';

export default function AdminDashboard() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-indigo-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-indigo-900">Users</h2>
          <p className="mt-2 text-indigo-700">Manage system users and permissions</p>
        </div>
        <div className="bg-indigo-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-indigo-900">Appointments</h2>
          <p className="mt-2 text-indigo-700">View and manage all appointments</p>
        </div>
        <div className="bg-indigo-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-indigo-900">Reports</h2>
          <p className="mt-2 text-indigo-700">Generate and view system reports</p>
        </div>
      </div>
    </div>
  );
} 