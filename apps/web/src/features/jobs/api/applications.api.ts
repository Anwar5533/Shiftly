import api from '@/shared/lib/api';

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

  getMyApplications: async (): Promise<JobApplication[]> => {
    const response = await api.get('/applications/my-applications');
    return response.data.data;
  },

  getApplicationsForJob: async (jobId: string): Promise<JobApplication[]> => {
    const response = await api.get(`/applications/job/${jobId}`);
    return response.data.data;
  },

  getRecentApplications: async (): Promise<JobApplication[]> => {
    const response = await api.get('/applications/recent');
    return response.data.data;
  },

  updateApplicationStatus: async (id: string, statusData: UpdateApplicationStatusData): Promise<JobApplication> => {
    const response = await api.patch(`/applications/${id}/status`, statusData);
    return response.data.data;
  },
};
