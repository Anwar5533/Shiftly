export type ApplicationStatus =
  'PENDING' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN' | 'COMPLETED';

export interface Application {
  id: string;
  jobId: string;
  workerId: string;
  status: ApplicationStatus;
  appliedAt: string;
  worker: {
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    experienceYears: number;
    rating: number;
  };
}

export const applicationsApi = {
  getApplicationsByJobId: async (jobId: string): Promise<Application[]> => {
    const response = await api.get<{ data: Application[] }>(`/applications/job/${jobId}`);
    return response.data.data;
  },

  updateApplicationStatus: async (
    applicationId: string,
    status: ApplicationStatus,
  ): Promise<Application> => {
    const response = await api.patch<{ data: Application }>(`/applications/${applicationId}/status`, { status });
    return response.data.data;
  },
};
