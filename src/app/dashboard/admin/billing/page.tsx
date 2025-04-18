'use client';

import { useEffect, useState } from 'react';
import { billingService, Subscription, PaymentMethod } from '@/services/billingService';

export default function AdminBillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      const [subData, pmData] = await Promise.all([
        billingService.getSubscription(),
        billingService.getPaymentMethods()
      ]);
      setSubscription(subData);
      setPaymentMethods(pmData);
    } catch (err) {
      setError('Failed to fetch billing information');
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      const { url } = await billingService.createBillingPortalSession();
      window.location.href = url;
    } catch (err) {
      setError('Failed to open billing portal');
    }
  };

  const handleUpgrade = async (priceId: string) => {
    try {
      const { url } = await billingService.createCheckoutSession(priceId);
      window.location.href = url;
    } catch (err) {
      setError('Failed to create checkout session');
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Billing & Subscription</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Subscription Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Current Subscription</h2>
          {subscription ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Plan</p>
                <p className="font-medium">{subscription.plan.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      subscription.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : subscription.status === 'past_due'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {subscription.status}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Next Billing Date</p>
                <p className="font-medium">
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={handleManageBilling}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Manage Subscription
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-500">No active subscription</p>
              <button
                onClick={() => handleUpgrade('price_basic')}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Subscribe Now
              </button>
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Payment Methods</h2>
          {paymentMethods.length > 0 ? (
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      {method.brand === 'visa' ? 'V' : method.brand === 'mastercard' ? 'M' : 'C'}
                    </div>
                    <div className="ml-4">
                      <p className="font-medium">•••• {method.last4}</p>
                      <p className="text-sm text-gray-500">
                        Expires {method.expMonth}/{method.expYear}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No payment methods on file</p>
          )}
        </div>
      </div>
    </div>
  );
} 