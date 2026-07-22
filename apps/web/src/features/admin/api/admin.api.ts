/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-floating-promises, @typescript-eslint/no-misused-promises, @typescript-eslint/no-unsafe-argument, @typescript-eslint/require-await, @typescript-eslint/no-base-to-string, @typescript-eslint/prefer-promise-reject-errors, no-useless-assignment -- TODO(RC3): Fix linting issues */
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
