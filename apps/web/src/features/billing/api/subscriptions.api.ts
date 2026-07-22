import api from '@/shared/lib/api';
import { ApiResponse } from "@shiftly/shared-types";

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
    const { data } = await api.get<ApiResponse<SubscriptionData>>('/subscriptions/current');
    return data;
  },

  getInvoices: async (): Promise<InvoiceData[]> => {
    const { data } = await api.get<ApiResponse<InvoiceData[]>>('/subscriptions/invoices');
    return data;
  },

  upgradePlan: async (plan: string): Promise<SubscriptionData> => {
    const { data } = await api.post<ApiResponse<SubscriptionData>>('/subscriptions/upgrade', { plan });
    return data;
  },
};
