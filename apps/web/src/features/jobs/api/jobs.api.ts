/* eslint-disable @typescript-eslint/no-explicit-any -- TODO(RC3): */
import api from '@/shared/lib/api';
import type { Job, ApiResponse } from '@shiftly/shared-types';
import type { PaginatedResponse } from './applications.api';

export interface CreateJobData {
  title: string;
  description: string;
  jobType: string;
  location: any;
  isRemote?: boolean;
  salaryMin: number;
  salaryMax: number;
  salaryCurrency?: string;
  salaryPeriod?: string;
  startDate: string;
  endDate?: string;
  shiftDurationHours?: number;
  positionsTotal?: number;
  applicationDeadline?: string;
}

export interface UpdateJobData extends Partial<CreateJobData> {
  status?: string;
}

export const jobsApi = {
  searchJobs: async (params?: Record<string, any>): Promise<Record<string, unknown>> => {
    const response = await api.get<ApiResponse<Record<string, unknown>>>('/jobs/search', { params });
    return response.data.data;
  },

  getMyJobs: async (page = 1, limit = 10): Promise<PaginatedResponse<Job>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Job>>>('/jobs/my-jobs', { params: { page, limit } });
    return response.data.data;
  },

  getJobById: async (id: string): Promise<Job> => {
    const response = await api.get<ApiResponse<Job>>(`/jobs/${id}`);
    return response.data.data;
  },

  createJob: async (jobData: CreateJobData): Promise<Job> => {
    const response = await api.post<ApiResponse<Job>>('/jobs', jobData);
    return response.data.data;
  },

  updateJob: async (id: string, jobData: UpdateJobData): Promise<Job> => {
    const response = await api.patch<ApiResponse<Job>>(`/jobs/${id}`, jobData);
    return response.data.data;
  },

  deleteJob: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/jobs/${id}`);
  },

  closeJob: async (id: string): Promise<Job> => {
    const response = await api.patch<ApiResponse<Job>>(`/jobs/${id}/close`);
    return response.data.data;
  },
};
