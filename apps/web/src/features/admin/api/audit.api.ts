 
import api from '@/shared/lib/api';
import type { ApiResponse } from "@shiftly/shared-types";

export const auditApi = {
  getLogs: async (): Promise<Record<string, unknown>[]> => {
    const { data } = await api.get<ApiResponse<Record<string, unknown>[]>>('/audit/logs');
    return data.data;
  },
};
