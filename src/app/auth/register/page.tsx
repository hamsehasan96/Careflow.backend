'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface RegistrationForm {
  providerName: string;
  admin: {
    name: string;
    email: string;
    password: string;
  };
}

interface FormErrors {
  providerName?: string;
  admin?: {
    name?: string;
    email?: string;
    password?: string;
  };
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegistrationForm>({
    providerName: '',
    admin: {
      name: '',
      email: '',
      password: '',
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.providerName.trim()) {
      newErrors.providerName = 'Organization name is required';
    }
    
    if (!formData.admin.name.trim()) {
      newErrors.admin = { ...newErrors.admin, name: 'Admin name is required' };
    }
    
    if (!formData.admin.email.trim()) {
      newErrors.admin = { ...newErrors.admin, email: 'Email is required' };
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.admin.email)) {
      newErrors.admin = { ...newErrors.admin, email: 'Invalid email format' };
    }
    
    if (!formData.admin.password) {
      newErrors.admin = { ...newErrors.admin, password: 'Password is required' };
    } else if (formData.admin.password.length < 8) {
      newErrors.admin = { ...newErrors.admin, password: 'Password must be at least 8 characters' };
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/providers/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const data = await response.json();
      
      // Store the token
      localStorage.setItem('token', data.token);
      
      toast.success('Your NDIS organization has been created. Welcome to CareFlow!');
      router.push('/dashboard/admin');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('admin.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        admin: {
          ...prev.admin,
          [field]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Register your NDIS organization
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="providerName" className="block text-sm font-medium text-gray-700">
                Organization Name
              </label>
              <div className="mt-1">
                <input
                  id="providerName"
                  name="providerName"
                  type="text"
                  required
                  value={formData.providerName}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.providerName ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.providerName && (
                  <p className="mt-2 text-sm text-red-600">{errors.providerName}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="admin.name" className="block text-sm font-medium text-gray-700">
                Admin Name
              </label>
              <div className="mt-1">
                <input
                  id="admin.name"
                  name="admin.name"
                  type="text"
                  required
                  value={formData.admin.name}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.admin?.name ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.admin?.name && (
                  <p className="mt-2 text-sm text-red-600">{errors.admin.name}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="admin.email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="admin.email"
                  name="admin.email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.admin.email}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.admin?.email ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.admin?.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.admin.email}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="admin.password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="admin.password"
                  name="admin.password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.admin.password}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.admin?.password ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.admin?.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.admin.password}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
