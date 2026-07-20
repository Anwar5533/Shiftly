export type ApplicationStatus = 'PENDING' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN' | 'COMPLETED';

export interface MockApplication {
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

// Simulated in-memory store for applications
let mockApplications: MockApplication[] = [
  {
    id: 'app_1',
    jobId: 'job_1', // We will assume this is the ID of a mock job
    workerId: 'worker_1',
    status: 'PENDING',
    appliedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    worker: {
      firstName: 'John',
      lastName: 'Doe',
      avatarUrl: null,
      experienceYears: 4,
      rating: 4.8,
    }
  },
  {
    id: 'app_2',
    jobId: 'job_1',
    workerId: 'worker_2',
    status: 'SHORTLISTED',
    appliedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    worker: {
      firstName: 'Jane',
      lastName: 'Smith',
      avatarUrl: null,
      experienceYears: 6,
      rating: 4.9,
    }
  },
  {
    id: 'app_3',
    jobId: 'job_1',
    workerId: 'worker_3',
    status: 'REJECTED',
    appliedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    worker: {
      firstName: 'Alice',
      lastName: 'Johnson',
      avatarUrl: null,
      experienceYears: 2,
      rating: 4.2,
    }
  }
];

export const applicationsApi = {
  getApplicationsByJobId: async (_jobId: string): Promise<MockApplication[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));
    // If the mock job doesn't match, we still return the mock list just so we have data to see
    return mockApplications; 
  },

  updateApplicationStatus: async (applicationId: string, status: ApplicationStatus): Promise<MockApplication> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const appIndex = mockApplications.findIndex(a => a.id === applicationId);
    if (appIndex === -1) throw new Error('Application not found');
    
    const updatedApp = { ...mockApplications[appIndex], status };
    mockApplications[appIndex] = updatedApp;
    
    return updatedApp;
  }
};
