/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-floating-promises, @typescript-eslint/no-misused-promises, @typescript-eslint/no-unsafe-argument, @typescript-eslint/require-await, @typescript-eslint/no-base-to-string, @typescript-eslint/prefer-promise-reject-errors, no-useless-assignment -- TODO(RC3): Fix linting issues */
import api from '@/shared/lib/api';

export interface SubscriptionData {
  id: string;
  userId: string;
  plan: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
}

export interface InvoiceData {
  id: string;
  date: string;
  amount: string;
  status: string;
  plan: string;
}

export const subscriptionsApi = {
  getCurrentSubscription: async (): Promise<SubscriptionData> => {
    const { data } = await api.get('/subscriptions/current');
    return data;
  },

  getInvoices: async (): Promise<InvoiceData[]> => {
    const { data } = await api.get('/subscriptions/invoices');
    return data;
  },

  upgradePlan: async (plan: string): Promise<SubscriptionData> => {
    const { data } = await api.post('/subscriptions/upgrade', { plan });
    return data;
  },
};
