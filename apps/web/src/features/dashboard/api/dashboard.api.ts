import api from '@/shared/lib/api';

export interface DashboardResponse {
  profile: any;
  upcomingShifts: any[];
  pendingApplications: any[];
}

export const dashboardApi = {
  getWorkerDashboard: async (): Promise<DashboardResponse> => {
    // The Axios instance automatically attaches the JWT Bearer token
    const response = await api.get('/dashboard/worker/me');
    return response.data;
  },
};
