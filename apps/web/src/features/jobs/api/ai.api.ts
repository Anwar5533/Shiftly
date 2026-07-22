import api from '@/shared/lib/api';

export const aiApi = {
  getMatchScore: async (jobId: string): Promise<{ score: number; reason: string }> => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
    const { data } = await api.get(`/ai/match/${jobId}`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- TODO(RC3): Address type safety
    return data;
  },
};
