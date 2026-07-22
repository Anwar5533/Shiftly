import api from '@/shared/lib/api';

export interface AdminDashboardStats {
  activeUsers: number;
  jobsProcessed: number;
  pendingKyc: number;
  isApiHealthy: boolean;
}

export const adminApi = {
  getDashboardStats: async (): Promise<AdminDashboardStats> => {
    const response = await api.get('/admin/stats');
// eslint-disable-next-line @typescript-eslint/no-unsafe-return -- TODO(RC3): Address type safety
    return response.data;
  },
};
