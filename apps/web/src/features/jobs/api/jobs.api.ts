import api from '@/shared/lib/api';
import type { Job } from '@shiftly/shared-types';

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
  searchJobs: async (params?: Record<string, any>): Promise<any> => {
    const response = await api.get('/jobs/search', { params });
    return response.data.data;
  },

  getMyJobs: async (): Promise<Job[]> => {
    const response = await api.get('/jobs/my-jobs');
    return response.data.data;
  },

  getJobById: async (id: string): Promise<Job> => {
    const response = await api.get(`/jobs/${id}`);
    return response.data.data;
  },

  createJob: async (jobData: CreateJobData): Promise<Job> => {
    const response = await api.post('/jobs', jobData);
    return response.data.data;
  },

  updateJob: async (id: string, jobData: UpdateJobData): Promise<Job> => {
    const response = await api.patch(`/jobs/${id}`, jobData);
    return response.data.data;
  },

  deleteJob: async (id: string): Promise<void> => {
    await api.delete(`/jobs/${id}`);
  },

  closeJob: async (id: string): Promise<Job> => {
    const response = await api.patch(`/jobs/${id}/close`);
    return response.data.data;
  },
};
