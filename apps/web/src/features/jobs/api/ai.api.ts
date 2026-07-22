import api from '@/shared/lib/api';
import type { ApiResponse } from '@shiftly/shared-types';

export const aiApi = {
  getMatchScore: async (jobId: string): Promise<{ score: number; reason: string }> => {
    const { data } = await api.get<ApiResponse<{ score: number; reason: string }>>(
      `/ai/match/${jobId}`,
    );
    return data.data;
  },
};
