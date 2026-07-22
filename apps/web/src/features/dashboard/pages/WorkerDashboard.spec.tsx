/* eslint-disable @typescript-eslint/no-explicit-any -- TODO(RC3): */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render as customRender } from '../../../shared/lib/test-utils.tsx';
import WorkerDashboard from './WorkerDashboard';
import { screen } from '@testing-library/react';
import * as workerApi from '../../profile/api/worker.api';
import * as applicationsApi from '../../jobs/api/applications.api';
import * as jobsApi from '../../jobs/api/jobs.api';

vi.mock('../../profile/api/worker.api', () => ({
  workerApi: {
    getDashboardStats: vi.fn(),
  },
}));

vi.mock('../../jobs/api/applications.api', () => ({
  applicationsApi: {
    getMyApplications: vi.fn(),
  },
}));

vi.mock('../../jobs/api/jobs.api', () => ({
  jobsApi: {
    searchJobs: vi.fn(),
  },
}));

vi.mock('../../jobs/api/shifts.api', () => ({
  shiftsApi: {
    getMyShifts: vi.fn(),
  },
}));

import * as shiftsApi from '../../jobs/api/shifts.api';

describe('WorkerDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (workerApi.workerApi.getDashboardStats as any).mockResolvedValue({
      totalEarnings: 1500,
      completedShifts: 10,
      activeApplications: 2,
    });
    (applicationsApi.applicationsApi.getMyApplications as any).mockResolvedValue({ items: [] });
    (shiftsApi.shiftsApi.getMyShifts as any).mockResolvedValue([]);
    (jobsApi.jobsApi.searchJobs as any).mockResolvedValue({
      items: [],
      pagination: { total: 0, page: 1, limit: 10 },
    });
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
    (shiftsApi.shiftsApi.getMyShifts as any).mockResolvedValue(mockShifts);

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
    (jobsApi.jobsApi.searchJobs as any).mockResolvedValue(mockJobs);

    customRender(<WorkerDashboard />);

    expect(await screen.findByText('Warehouse Associate Role')).toBeInTheDocument();
    expect(screen.getByText('₹15/hr')).toBeInTheDocument();
  });
});
