/* eslint-disable @typescript-eslint/no-explicit-any -- TODO(RC3): Address type safety */
import api from '@/shared/lib/api';

export const analyticsApi = {
  getStats: async (): Promise<any> => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
    const { data } = await api.get('/analytics/stats');
    return data;
  },

  getRevenue: async (): Promise<any[]> => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
    const { data } = await api.get('/analytics/revenue');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- TODO(RC3): Address type safety
    return data;
  },
};
