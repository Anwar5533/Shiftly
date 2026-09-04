import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render as customRender } from '../../../shared/lib/test-utils.tsx';
import WorkerDashboard from './WorkerDashboard';
import { screen, cleanup } from '@testing-library/react';
import { dashboardApi } from '../api/dashboard.api';
import * as jobsApi from '../../jobs/api/jobs.api';

vi.mock('../api/dashboard.api', () => ({
  dashboardApi: {
    getWorkerDashboard: vi.fn(),
  },
}));

vi.mock('@/app/store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/app/store')>();
  return {
    ...actual,
    useAppSelector: vi.fn(() => ({ user: { sub: 'worker-1', email: 'worker@test.com' } })),
    useAppDispatch: vi.fn(),
  };
});

vi.mock('../../jobs/api/jobs.api', () => ({
  jobsApi: {
    searchJobs: vi.fn(),
  },
}));

describe('WorkerDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (dashboardApi.getWorkerDashboard as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      profile: {
        totalEarnings: 1500,
        firstName: 'Worker',
      },
      upcomingShifts: Array(10).fill({}),
      pendingApplications: Array(2).fill({}),
    });

    (jobsApi.jobsApi.searchJobs as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      items: [],
      pagination: { total: 0, page: 1, limit: 10 },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders without crashing', () => {
    const { container } = customRender(<WorkerDashboard />);
    expect(container).toBeInTheDocument();
  });

  it('renders stats correctly', async () => {
    customRender(<WorkerDashboard />);

    expect(await screen.findByText('₹1500')).toBeInTheDocument();
    expect(await screen.findByText('10')).toBeInTheDocument();
    expect(await screen.findByText('2')).toBeInTheDocument();
  });

  it('renders upcoming shifts correctly', async () => {
    const mockShifts = [
      {
        id: 'shift-1',
        jobId: 'job-1',
        status: 'SCHEDULED',
        scheduledStart: '2023-10-25T09:00:00.000Z',
        scheduledEnd: '2023-10-25T17:00:00.000Z',
        job: {
          title: 'Test Job Shift',
          employer: { companyName: 'Test Company' },
          startDate: '2023-10-25T09:00:00.000Z',
          startTime: '09:00 AM',
          endTime: '05:00 PM',
        },
      },
    ];

    (dashboardApi.getWorkerDashboard as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      profile: { totalEarnings: 0, firstName: 'Worker' },
      upcomingShifts: mockShifts,
      pendingApplications: [],
    });

    customRender(<WorkerDashboard />);

    expect(await screen.findByText('Test Job Shift')).toBeInTheDocument();
    expect(screen.getByText('Test Company')).toBeInTheDocument();
  });

  it('renders recommended jobs correctly', async () => {
    const mockJobs = {
      items: [
        {
          id: 'job-1',
          title: 'Warehouse Associate Role',
          description: 'Great job',
          salaryCurrency: 'USD',
          salaryMax: 15,
          salaryPeriod: 'HOURLY',
          jobType: 'FULL_TIME',
          location: { city: 'New York' },
        },
      ],
      pagination: {
        total: 1,
        page: 1,
        limit: 10,
      },
    };
    (jobsApi.jobsApi.searchJobs as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockJobs);

    customRender(<WorkerDashboard />);

    expect(await screen.findByText('Warehouse Associate Role')).toBeInTheDocument();
    expect(screen.getByText('$15/hr')).toBeInTheDocument();
  });
});
