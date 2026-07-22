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
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
    const { data } = await api.get('/subscriptions/current');
// eslint-disable-next-line @typescript-eslint/no-unsafe-return -- TODO(RC3): Address type safety
    return data;
  },

  getInvoices: async (): Promise<InvoiceData[]> => {
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
    const { data } = await api.get('/subscriptions/invoices');
// eslint-disable-next-line @typescript-eslint/no-unsafe-return -- TODO(RC3): Address type safety
    return data;
  },

  upgradePlan: async (plan: string): Promise<SubscriptionData> => {
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
    const { data } = await api.post('/subscriptions/upgrade', { plan });
// eslint-disable-next-line @typescript-eslint/no-unsafe-return -- TODO(RC3): Address type safety
    return data;
  },
};
