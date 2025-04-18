import { api } from './api';

export interface Subscription {
  id: string;
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodEnd: string;
  plan: {
    name: string;
    price: number;
    interval: 'month' | 'year';
  };
}

export interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  expMonth: number;
  expYear: number;
  brand: string;
}

export const billingService = {
  async getSubscription(): Promise<Subscription> {
    const response = await api.get('/api/billing/subscription');
    return response.data;
  },

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await api.get('/api/billing/payment-methods');
    return response.data;
  },

  async createCheckoutSession(priceId: string): Promise<{ url: string }> {
    const response = await api.post('/api/billing/create-checkout-session', { priceId });
    return response.data;
  },

  async createBillingPortalSession(): Promise<{ url: string }> {
    const response = await api.post('/api/billing/create-portal-session');
    return response.data;
  }
}; 