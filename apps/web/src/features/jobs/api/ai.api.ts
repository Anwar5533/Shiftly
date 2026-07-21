import api from '@/shared/lib/api';

export const aiApi = {
  getMatchScore: async (jobId: string): Promise<{ score: number, reason: string }> => {
    const { data } = await api.get(`/ai/match/${jobId}`);
    return data;
  },
};
