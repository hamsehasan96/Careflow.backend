'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/auth/login');
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="flex justify-between items-center h-16 px-4">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            Welcome, {session?.user?.name}
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {session?.user?.role}
          </span>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
} 