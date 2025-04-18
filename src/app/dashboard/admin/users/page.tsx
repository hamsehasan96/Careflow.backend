'use client';

import { useEffect, useState } from 'react';
import { userService, User } from '@/services/userService';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, role: User['role']) => {
    try {
      await userService.updateUserRole(userId, role);
      await fetchUsers();
      setShowRoleModal(false);
    } catch (err) {
      setError('Failed to update user role');
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    try {
      await userService.deactivateUser(userId);
      await fetchUsers();
    } catch (err) {
      setError('Failed to deactivate user');
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      await userService.resetPassword(userId);
      setShowResetModal(false);
    } catch (err) {
      setError('Failed to reset password');
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Staff Management</h1>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                  {user.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                  {user.role}
                </td>
                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : user.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200 text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setShowRoleModal(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Change Role
                  </button>
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setShowResetModal(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Reset Password
                  </button>
                  {user.status === 'active' && (
                    <button
                      onClick={() => handleDeactivateUser(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Change User Role</h3>
            <select
              value={selectedUser.role}
              onChange={(e) => handleUpdateRole(selectedUser.id, e.target.value as User['role'])}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="admin">Admin</option>
              <option value="support_worker">Support Worker</option>
            </select>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowRoleModal(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Reset Password</h3>
            <p className="mb-4">Are you sure you want to reset the password for {selectedUser.name}?</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 mr-4"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResetPassword(selectedUser.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
} 