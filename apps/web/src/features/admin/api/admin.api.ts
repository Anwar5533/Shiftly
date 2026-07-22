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
    return response.data;
  },
};
