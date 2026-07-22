import api from '../../../shared/lib/api';
import type { Wallet, Transaction } from '@shiftly/shared-types';

export const walletApi = {
  getWallet: async (): Promise<Wallet> => {
    const response = await api.get('/wallets/me');
// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
    return response.data.data;
  },

  getTransactions: async (): Promise<Transaction[]> => {
    const response = await api.get('/wallets/me/transactions');
// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
    return response.data.data ?? [];
  },

  topUp: async (amount: number): Promise<Wallet> => {
    const response = await api.post('/wallets/topup', { amount });
// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
    return response.data.data;
  },

  withdraw: async (amount: number): Promise<Wallet> => {
    const response = await api.post('/wallets/withdraw', { amount });
// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
    return response.data.data;
  },
};
