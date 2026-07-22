import api from '@/shared/lib/api';
import type { ApiResponse } from '@shiftly/shared-types';

export const analyticsApi = {
  getStats: async (): Promise<Record<string, unknown>> => {
    const { data } = await api.get<ApiResponse<Record<string, unknown>>>('/analytics/stats');
    return data.data;
  },

  getRevenue: async (): Promise<Record<string, unknown>[]> => {
    const { data } = await api.get<ApiResponse<Record<string, unknown>[]>>('/analytics/revenue');
    return data.data;
  },
};
