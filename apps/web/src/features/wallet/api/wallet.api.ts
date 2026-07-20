import api from '@/shared/lib/api';
import type { ApiResponse, Wallet, Transaction } from '@shiftly/shared-types';

export const walletApi = {
  getWalletBalance: async (): Promise<Wallet> => {
    const res = await api.get<ApiResponse<Wallet>>('/payments/wallet/balance');
    return res.data.data;
  },

  getWalletTransactions: async (): Promise<Transaction[]> => {
    const res = await api.get<ApiResponse<Transaction[]>>('/payments/wallet/transactions');
    return res.data.data;
  },

  topupWallet: async (data: { amount: number; paymentMethodId: string }): Promise<Transaction> => {
    const res = await api.post<ApiResponse<Transaction>>('/payments/wallet/topup', data);
    return res.data.data;
  },

  withdrawFunds: async (data: { amount: number; targetAccountId: string }): Promise<Transaction> => {
    const res = await api.post<ApiResponse<Transaction>>('/payments/wallet/withdraw', data);
    return res.data.data;
  },
};
