'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Bell, Mail, Lock, CreditCard, User, Building } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [notificationSettings, setNotificationSettings] = useState({
    emailAppointments: true,
    emailReminders: true,
    emailUpdates: false,
    smsAppointments: true,
    smsReminders: true,
    smsUpdates: false,
  });

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your account settings and preferences.
          </p>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="sm:flex sm:items-start">
            {/* Tabs */}
            <div className="w-full max-w-xs border-r border-gray-200 sm:w-64">
              <nav className="flex flex-col py-6 px-4 sm:px-6" aria-label="Settings tabs">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'profile'
                      ? 'bg-teal-50 text-teal-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <User className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab('organization')}
                  className={`mt-2 flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'organization'
                      ? 'bg-teal-50 text-teal-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Building className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  Organization
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`mt-2 flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'notifications'
                      ? 'bg-teal-50 text-teal-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Bell className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  Notifications
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`mt-2 flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'password'
                      ? 'bg-teal-50 text-teal-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Lock className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  Password
                </button>
                <button
                  onClick={() => setActiveTab('subscription')}
                  className={`mt-2 flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'subscription'
                      ? 'bg-teal-50 text-teal-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <CreditCard className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  Subscription
                </button>
              </nav>
            </div>

            {/* Content */}
            <div className="p-6 w-full">
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Update your personal information and contact details.
                  </p>
                  <form className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
                          First name
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="first-name"
                            id="first-name"
                            defaultValue="David"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
                          Last name
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="last-name"
                            id="last-name"
                            defaultValue="Wilson"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email address
                        </label>
                        <div className="mt-1">
                          <input
                            id="email"
                            name="email"
                            type="email"
                            defaultValue="david.wilson@careflow.com"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                          Phone number
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="phone"
                            id="phone"
                            defaultValue="0456 789 012"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-6">
                        <label htmlFor="photo" className="block text-sm font-medium text-gray-700">
                          Profile photo
                        </label>
                        <div className="mt-2 flex items-center">
                          <span className="h-12 w-12 overflow-hidden rounded-full bg-gray-100">
                            <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          </span>
                          <button
                            type="button"
                            className="ml-5 rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                          >
                            Change
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-teal-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'organization' && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Organization Settings</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Update your organization details and preferences.
                  </p>
                  <form className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-4">
                        <label htmlFor="org-name" className="block text-sm font-medium text-gray-700">
                          Organization name
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="org-name"
                            id="org-name"
                            defaultValue="CareFlow Health Services"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-4">
                        <label htmlFor="abn" className="block text-sm font-medium text-gray-700">
                          ABN
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="abn"
                            id="abn"
                            defaultValue="12 345 678 901"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-6">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                          Address
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="address"
                            id="address"
                            defaultValue="123 Health Street"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                          City
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="city"
                            id="city"
                            defaultValue="Perth"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                          State
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="state"
                            id="state"
                            defaultValue="WA"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="postal-code" className="block text-sm font-medium text-gray-700">
                          Postal code
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="postal-code"
                            id="postal-code"
                            defaultValue="6000"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-6">
                        <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
                          Organization logo
                        </label>
                        <div className="mt-2 flex items-center">
                          <span className="h-12 w-12 overflow-hidden rounded-md bg-gray-100">
                            <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          </span>
                          <button
                            type="button"
                            className="ml-5 rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                          >
                            Change
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-teal-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Notification Settings</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Manage how you receive notifications and reminders.
                  </p>
                  <form className="mt-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                        <div className="mt-2 space-y-4">
                          <div className="relative flex items-start">
                            <div className="flex h-5 items-center">
                              <input
                                id="email-appointments"
                                name="emailAppointments"
                                type="checkbox"
                                checked={notificationSettings.emailAppointments}
                                onChange={handleNotificationChange}
                                className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="email-appointments" className="font-medium text-gray-700">
                                Appointment confirmations
                              </label>
                              <p className="text-gray-500">Receive emails when appointments are booked, changed, or cancelled.</p>
                            </div>
                          </div>
                          <div className="relative flex items-start">
                            <div className="flex h-5 items-center">
                              <input
                                id="email-reminders"
                                name="emailReminders"
                                type="checkbox"
                                checked={notificationSettings.emailReminders}
                                onChange={handleNotificationChange}
                                className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="email-reminders" className="font-medium text-gray-700">
                                Appointment reminders
                              </label>
                              <p className="text-gray-500">Receive email reminders before upcoming appointments.</p>
                            </div>
                          </div>
                          <div className="relative flex items-start">
                            <div className="flex h-5 items-center">
                              <input
                                id="email-updates"
                                name="emailUpdates"
                                type="checkbox"
                                checked={notificationSettings.emailUpdates}
                                onChange={handleNotificationChange}
                                className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="email-updates" className="font-medium text-gray-700">
                                System updates
                              </label>
                              <p className="text-gray-500">Receive emails about system updates and new features.</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-900">SMS Notifications</h3>
                        <div className="mt-2 space-y-4">
                          <div className="relative flex items-start">
                            <div className="flex h-5 items-center">
                              <input
                                id="sms-appointments"
                                name="smsAppointments"
                                type="checkbox"
                                checked={notificationSettings.smsAppointments}
                                onChange={handleNotificationChange}
                                className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="sms-appointments" className="font-medium text-gray-700">
                                Appointment confirmations
                              </label>
                              <p className="text-gray-500">Receive SMS when appointments are booked, changed, or cancelled.</p>
                            </div>
                          </div>
                          <div className="relative flex items-start">
                            <div className="flex h-5 items-center">
                              <input
                                id="sms-reminders"
                                name="smsReminders"
                                type="checkbox"
                                checked={notificationSettings.smsReminders}
                                onChange={handleNotificationChange}
                                className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="sms-reminders" className="font-medium text-gray-700">
                                Appointment reminders
                              </label>
                              <p className="text-gray-500">Receive SMS reminders before upcoming appointments.</p>
                            </div>
                          </div>
                          <div className="relative flex items-start">
                            <div className="flex h-5 items-center">
                              <input
                                id="sms-updates"
                                name="smsUpdates"
                                type="checkbox"
                                checked={notificationSettings.smsUpdates}
                                onChange={handleNotificationChange}
                                className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="sms-updates" className="font-medium text-gray-700">
                                System updates
                              </label>
                              <p className="text-gray-500">Receive SMS about system updates and new features.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <button
                        type="button"
                        className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-teal-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'password' && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Change Password</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Update your password to maintain account security.
                  </p>
                  <form className="mt-6 space-y-6">
                    <div>
                      <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">
                        Current password
                      </label>
                      <div className="mt-1">
                        <input
                          id="current-password"
                          name="current-password"
                          type="password"
                          autoComplete="current-password"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                        New password
                      </label>
                      <div className="mt-1">
                        <input
                          id="new-password"
                          name="new-password"
                          type="password"
                          autoComplete="new-password"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                        Confirm password
                      </label>
                      <div className="mt-1">
                        <input
                          id="confirm-password"
                          name="confirm-password"
                          type="password"
                          autoComplete="new-password"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-teal-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                      >
                        Update Password
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'subscription' && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Subscription Plan</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Manage your subscription and billing information.
                  </p>

                  <div className="mt-6 bg-teal-50 p-4 rounded-lg border border-teal-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-teal-800">Growth Plan</h3>
                        <p className="text-sm text-teal-600">$149/month</p>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-teal-100 px-3 py-0.5 text-sm font-medium text-teal-800">
                        Active
                      </span>
                    </div>
                    <div className="mt-4 border-t border-teal-200 pt-4">
                      <h4 className="text-sm font-medium text-teal-800">Plan includes:</h4>
                      <ul className="mt-2 space-y-1 text-sm text-teal-700">
                        <li className="flex items-center">
                          <svg className="h-4 w-4 text-teal-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Up to 15 staff users
                        </li>
                        <li className="flex items-center">
                          <svg className="h-4 w-4 text-teal-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Up to 50 participants
                        </li>
                        <li className="flex items-center">
                          <svg className="h-4 w-4 text-teal-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          NDIS invoicing
                        </li>
                        <li className="flex items-center">
                          <svg className="h-4 w-4 text-teal-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Client management
                        </li>
                        <li className="flex items-center">
                          <svg className="h-4 w-4 text-teal-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Appointment scheduling
                        </li>
                      </ul>
                    </div>
                    <div className="mt-4 flex">
                      <button
                        type="button"
                        className="inline-flex items-center rounded-md border border-teal-700 bg-white px-3 py-2 text-sm font-medium text-teal-700 shadow-sm hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                      >
                        View Plan Details
                      </button>
                      <button
                        type="button"
                        className="ml-3 inline-flex items-center rounded-md border border-transparent bg-teal-700 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                      >
                        Upgrade Plan
                      </button>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-900">Available Plans</h3>
                    <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="relative rounded-lg border border-gray-300 bg-white p-4 shadow-sm">
                        <div className="flex flex-col h-full">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">Starter</h3>
                            <p className="mt-1 text-sm text-gray-500">For small providers just getting started.</p>
                            <p className="mt-4">
                              <span className="text-2xl font-bold tracking-tight text-gray-900">$49</span>
                              <span className="text-base font-medium text-gray-500">/month</span>
                            </p>
                          </div>
                          <ul className="mt-4 space-y-2 text-sm text-gray-500 flex-grow">
                            <li className="flex items-center">
                              <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Up to 3 staff users
                            </li>
                            <li className="flex items-center">
                              <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Up to 10 participants
                            </li>
                            <li className="flex items-center">
                              <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Basic client profiles
                            </li>
                            <li className="flex items-center">
                              <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Basic rostering
                            </li>
                          </ul>
                          <div className="mt-6">
                            <button
                              type="button"
                              className="w-full inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                            >
                              Downgrade
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="relative rounded-lg border-2 border-teal-500 bg-white p-4 shadow-sm">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-500 px-3 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
                          Current Plan
                        </div>
                        <div className="flex flex-col h-full">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">Growth</h3>
                            <p className="mt-1 text-sm text-gray-500">For growing providers with multiple staff.</p>
                            <p className="mt-4">
                              <span className="text-2xl font-bold tracking-tight text-gray-900">$149</span>
                              <span className="text-base font-medium text-gray-500">/month</span>
                            </p>
                          </div>
                          <ul className="mt-4 space-y-2 text-sm text-gray-500 flex-grow">
                            <li className="flex items-center">
                              <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Up to 15 staff users
                            </li>
                            <li className="flex items-center">
                              <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Up to 50 participants
                            </li>
                            <li className="flex items-center">
                              <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              NDIS invoicing
                            </li>
                            <li className="flex items-center">
                              <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Advanced reporting
                            </li>
                          </ul>
                          <div className="mt-6">
                            <button
                              type="button"
                              className="w-full inline-flex justify-center rounded-md border border-transparent bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                              disabled
                            >
                              Current Plan
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="relative rounded-lg border border-gray-300 bg-white p-4 shadow-sm">
                        <div className="flex flex-col h-full">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">Pro</h3>
                            <p className="mt-1 text-sm text-gray-500">For established providers with multiple locations.</p>
                            <p className="mt-4">
                              <span className="text-2xl font-bold tracking-tight text-gray-900">$299</span>
                              <span className="text-base font-medium text-gray-500">/month</span>
                            </p>
                          </div>
                          <ul className="mt-4 space-y-2 text-sm text-gray-500 flex-grow">
                            <li className="flex items-center">
                              <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Up to 50 staff users
                            </li>
                            <li className="flex items-center">
                              <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Up to 100 participants
                            </li>
                            <li className="flex items-center">
                              <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Advanced NDIS invoicing
                            </li>
                            <li className="flex items-center">
                              <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Multi-location support
                            </li>
                          </ul>
                          <div className="mt-6">
                            <button
                              type="button"
                              className="w-full inline-flex justify-center rounded-md border border-transparent bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                            >
                              Upgrade
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-900">Billing Information</h3>
                    <div className="mt-2 bg-gray-50 p-4 rounded-md border border-gray-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Visa ending in 4242</p>
                          <p className="text-sm text-gray-500">Expires 12/2025</p>
                        </div>
                        <button
                          type="button"
                          className="text-sm font-medium text-teal-600 hover:text-teal-500"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
