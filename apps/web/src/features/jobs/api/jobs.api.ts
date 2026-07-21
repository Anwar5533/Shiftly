import type { Job, PaginatedResponse } from '@shiftly/shared-types';

// Mock in-memory data
let mockJobs: Job[] = [
  {
    id: 'job-1',
    employerId: 'emp-1',
    title: 'Senior Frontend Developer',
    description: 'We are looking for an experienced frontend developer to join our team. You will be responsible for building modern UI components.',
    skillsRequired: ['React', 'TypeScript', 'Tailwind'],
    jobType: 'PERMANENT',
    location: { city: 'San Francisco', state: 'CA', address: '456 Tech Blvd', country: 'USA', postalCode: '94105', isRemote: false, lat: 37.7749, lng: -122.4194 },
    salaryMin: 1500000,
    salaryMax: 2500000,
    salaryCurrency: 'INR',
    salaryPeriod: 'ANNUAL',
    status: 'PUBLISHED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  } as unknown as Job,
  {
    id: 'job-2',
    employerId: 'emp-2',
    title: 'Part-time Delivery Partner',
    description: 'Join our delivery network. Flexible hours, good pay. Must have own vehicle.',
    skillsRequired: ['Driving License', 'Smartphone'],
    jobType: 'GIG',
    location: { city: 'Mumbai', isRemote: false, address: '', country: '', state: '', postalCode: '', lat: 0, lng: 0 },
    salaryMin: 200,
    salaryMax: 500,
    salaryCurrency: 'INR',
    salaryPeriod: 'HOURLY',
    status: 'PUBLISHED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  } as unknown as Job,
  {
    id: 'job-3',
    employerId: 'emp-1',
    title: 'Full Stack Engineer (Remote)',
    description: 'Looking for a full stack engineer proficient in Node.js and React.',
    skillsRequired: ['Node.js', 'React', 'PostgreSQL'],
    jobType: 'PERMANENT',
    location: { city: 'New York', state: 'NY', address: '123 Wall St', country: 'USA', postalCode: '10001', isRemote: false, lat: 40.7128, lng: -74.0060 },
    salaryMin: 2000000,
    salaryMax: 3500000,
    salaryCurrency: 'INR',
    salaryPeriod: 'ANNUAL',
    status: 'PUBLISHED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  } as unknown as Job
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const jobsApi = {
  createJob: async (data: any): Promise<Job> => {
    await delay(600);
    const newJob: Job = {
      ...data,
      id: `job-${Date.now()}`,
      status: 'PUBLISHED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as unknown as Job;
    mockJobs.push(newJob);
    return newJob;
  },

  searchJobs: async (_params?: Record<string, any>): Promise<PaginatedResponse<Job>> => {
    await delay(400);
    return {
      items: mockJobs,
      total: mockJobs.length,
      page: 1,
      limit: 10,
      totalPages: 1
    } as unknown as PaginatedResponse<Job>;
  },

  getJobById: async (id: string): Promise<Job> => {
    await delay(300);
    const job = mockJobs.find(j => j.id === id);
    if (!job) {
      throw { response: { data: { error: { message: 'Job not found' } } } };
    }
    return job;
  },

  closeJob: async (id: string): Promise<Job> => {
    await delay(400);
    const jobIndex = mockJobs.findIndex(j => j.id === id);
    if (jobIndex === -1) {
      throw { response: { data: { error: { message: 'Job not found' } } } };
    }
    mockJobs[jobIndex] = { ...mockJobs[jobIndex], status: 'CLOSED' as any };
    return mockJobs[jobIndex];
  },
};
