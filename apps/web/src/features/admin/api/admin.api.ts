import api from '@/shared/lib/api';
import type { ApiResponse } from '@shiftly/shared-types';

export interface AdminDashboardStats {
  activeUsers: number;
  jobsProcessed: number;
  pendingKyc: number;
  isApiHealthy: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
  registered: string;
}

export const adminApi = {
  getDashboardStats: async (): Promise<AdminDashboardStats> => {
    const response = await api.get<ApiResponse<AdminDashboardStats>>('/admin/stats');
    return response.data.data;
  },

  getUsers: async (): Promise<AdminUser[]> => {
    const response = await api.get<ApiResponse<AdminUser[]>>('/admin/users');
    return response.data?.data ?? [];
  },

  suspendUser: async (userId: string): Promise<{ status: string }> => {
    const response = await api.patch<ApiResponse<{ status: string }>>(
      `/admin/users/${userId}/suspend`,
    );
    return response.data.data;
  },

  deleteUser: async (userId: string): Promise<{ success: boolean }> => {
    const response = await api.delete<ApiResponse<{ success: boolean }>>(`/admin/users/${userId}`);
    return response.data.data;
  },
};

