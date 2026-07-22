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
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
    const { data } = await api.get('/referrals/code');
// eslint-disable-next-line @typescript-eslint/no-unsafe-return -- TODO(RC3): Address type safety
    return data;
  },

  getReferralStats: async (): Promise<ReferralStatsData> => {
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
    const { data } = await api.get('/referrals/stats');
// eslint-disable-next-line @typescript-eslint/no-unsafe-return -- TODO(RC3): Address type safety
    return data;
  },
};
