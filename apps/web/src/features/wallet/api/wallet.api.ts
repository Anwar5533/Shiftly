import api from '../../../shared/lib/api';
import type { Wallet, Transaction } from '@shiftly/shared-types';

export const walletApi = {
  getWallet: async (): Promise<Wallet> => {
    const response = await api.get('/wallets/me');
    return response.data.data;
  },
  
  getTransactions: async (): Promise<Transaction[]> => {
    const response = await api.get('/wallets/me/transactions');
    return response.data.data ?? [];
  },

  topUp: async (amount: number): Promise<Wallet> => {
    const response = await api.post('/wallets/topup', { amount });
    return response.data.data;
  },

  withdraw: async (amount: number): Promise<Wallet> => {
    const response = await api.post('/wallets/withdraw', { amount });
    return response.data.data;
  }
};
