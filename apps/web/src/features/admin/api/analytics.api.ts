import api from '@/shared/lib/api';

export const analyticsApi = {
  getStats: async (): Promise<any> => {
    const { data } = await api.get('/analytics/stats');
    return data;
  },

  getRevenue: async (): Promise<any[]> => {
    const { data } = await api.get('/analytics/revenue');
    return data;
  }
};
