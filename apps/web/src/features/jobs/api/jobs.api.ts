import api from '@/shared/lib/api';
import type { ApiResponse, Job, PaginatedResponse } from '@shiftly/shared-types';

export const jobsApi = {
  createJob: async (data: any): Promise<Job> => {
    const res = await api.post<ApiResponse<Job>>('/jobs', data);
    return res.data.data;
  },

  searchJobs: async (params?: Record<string, any>): Promise<PaginatedResponse<Job>> => {
    const res = await api.get<ApiResponse<PaginatedResponse<Job>>>('/jobs/search', { params });
    return res.data.data;
  },

  getJobById: async (id: string): Promise<Job> => {
    const res = await api.get<ApiResponse<Job>>(`/jobs/${id}`);
    return res.data.data;
  },

  closeJob: async (id: string): Promise<Job> => {
    const res = await api.patch<ApiResponse<Job>>(`/jobs/${id}/close`);
    return res.data.data;
  },
};
