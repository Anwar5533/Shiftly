/* eslint-disable @typescript-eslint/no-explicit-any -- TODO(RC3): */
import api from '@/shared/lib/api';

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface JobApplication {
  id: string;
  jobId: string;
  workerId: string;
  status: string;
  coverLetter?: string;
  appliedAt: string;
  job?: any;
  worker?: any;
}

export interface CreateApplicationData {
  jobId: string;
  coverLetter?: string;
}

export interface UpdateApplicationStatusData {
  status: string;
  employerNote?: string;
}

export const applicationsApi = {
  applyToJob: async (applicationData: CreateApplicationData): Promise<JobApplication> => {
    const response = await api.post('/applications', applicationData);
    return response.data.data;
  },

  checkApplication: async (jobId: string): Promise<{ applied: boolean; applicationId?: string }> => {
    const response = await api.get(`/applications/check/${jobId}`);
    return response.data.data;
  },

  getMyApplications: async (page = 1, limit = 10): Promise<PaginatedResponse<JobApplication>> => {
    const response = await api.get('/applications/my-applications', { params: { page, limit } });
    return response.data.data;
  },

  getApplicationsForJob: async (
    jobId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<JobApplication>> => {
    const response = await api.get(`/applications/job/${jobId}`, { params: { page, limit } });
    return response.data.data;
  },

  getRecentApplications: async (): Promise<JobApplication[]> => {
    const response = await api.get('/applications/recent');
    return response.data.data;
  },

  updateApplicationStatus: async (
    id: string,
    statusData: UpdateApplicationStatusData,
  ): Promise<JobApplication> => {
    const response = await api.patch(`/applications/${id}/status`, statusData);
    return response.data.data;
  },
};
