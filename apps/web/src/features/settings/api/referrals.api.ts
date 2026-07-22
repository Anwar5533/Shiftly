import api from '@/shared/lib/api';
import type { ApiResponse } from '@shiftly/shared-types';

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
    const { data } = await api.get<ApiResponse<ReferralCodeData>>('/referrals/code');
    return data.data;
  },

  getReferralStats: async (): Promise<ReferralStatsData> => {
    const { data } = await api.get<ApiResponse<ReferralStatsData>>('/referrals/stats');
    return data.data;
  },
};
