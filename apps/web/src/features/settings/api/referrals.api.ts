/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-floating-promises, @typescript-eslint/no-misused-promises, @typescript-eslint/no-unsafe-argument, @typescript-eslint/require-await, @typescript-eslint/no-base-to-string, @typescript-eslint/prefer-promise-reject-errors, no-useless-assignment -- TODO(RC3): Fix linting issues */
import api from '@/shared/lib/api';

export interface ReferralCodeData {
  id: string;
  userId: string;
  code: string;
}

export interface ReferralStatsData {
  totalReferrals: number;
  activeReferrals: number;
  totalEarned: number;
  currency: string;
}

export const referralsApi = {
  getReferralCode: async (): Promise<ReferralCodeData> => {
    const { data } = await api.get('/referrals/code');
    return data;
  },

  getReferralStats: async (): Promise<ReferralStatsData> => {
    const { data } = await api.get('/referrals/stats');
    return data;
  },
};
