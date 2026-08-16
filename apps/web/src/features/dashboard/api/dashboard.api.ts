/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return */
import api from '@/shared/lib/api';

export interface DashboardResponse {
  profile: any;
  upcomingShifts?: any[];
  activeJobs?: any[];
  pendingApplications: any[];
}

export interface AdminDashboardResponse {
  stats: {
    totalUsers: number;
    totalActiveJobs: number;
    totalCompletedShifts: number;
    totalPlatformRevenue: number;
  };
  recentActivity: any[];
}

export const dashboardApi = {
  getWorkerDashboard: async (): Promise<DashboardResponse> => {
    // The Axios instance automatically attaches the JWT Bearer token
    const response = await api.get('/dashboard/worker/me');
    return response.data;
  },
  getEmployerDashboard: async (): Promise<DashboardResponse> => {
    const response = await api.get('/dashboard/employer/me');
    return response.data;
  },
  getAdminDashboard: async (): Promise<AdminDashboardResponse> => {
    const response = await api.get('/dashboard/admin/summary');
    return response.data;
  },
};
