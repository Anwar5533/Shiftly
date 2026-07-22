/* eslint-disable @typescript-eslint/no-explicit-any -- TODO(RC3): Address type safety */
import api from '@/shared/lib/api';

export const auditApi = {
  getLogs: async (): Promise<any[]> => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
    const { data } = await api.get('/audit/logs');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- TODO(RC3): Address type safety
    return data;
  },
};
