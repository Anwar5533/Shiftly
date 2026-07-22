/* eslint-disable @typescript-eslint/no-explicit-any -- TODO(RC3): */
import api from '@/shared/lib/api';

export const auditApi = {
  getLogs: async (): Promise<any[]> => {
    const { data } = await api.get('/audit/logs');
    return data;
  },
};
