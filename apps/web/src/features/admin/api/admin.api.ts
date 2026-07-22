import api from '@/shared/lib/api';
import type { ApiResponse } from "@shiftly/shared-types";

export interface AdminDashboardStats {
  activeUsers: number;
  jobsProcessed: number;
  pendingKyc: number;
  isApiHealthy: boolean;
}

export const adminApi = {
  getDashboardStats: async (): Promise<AdminDashboardStats> => {
    const response = await api.get<ApiResponse<AdminDashboardStats>>('/admin/stats');
    return response.data.data;
  },
};
