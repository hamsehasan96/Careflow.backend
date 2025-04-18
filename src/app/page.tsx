'use client';

import Link from "next/link";
import { HeartPulse } from "lucide-react";
import { ReactElement } from "react";

export default function Home(): ReactElement {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="text-center space-y-8 max-w-2xl">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-2">
          <HeartPulse className="h-12 w-12 text-blue-600 dark:text-blue-400" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">CareFlow</h1>
        </div>

        {/* Welcome Message */}
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-200">
            Welcome to CareFlow
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Your comprehensive healthcare management solution
          </p>
        </div>

        {/* Dashboard Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          Go to Dashboard
        </Link>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-900 dark:text-white">Appointment Management</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Schedule and track patient appointments</p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-900 dark:text-white">Patient Records</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Access and manage patient information</p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-900 dark:text-white">Staff Management</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Coordinate healthcare professionals</p>
          </div>
        </div>
      </div>
    </div>
  );
}
