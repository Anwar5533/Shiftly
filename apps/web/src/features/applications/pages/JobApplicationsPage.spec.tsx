import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render as customRender } from '../../../shared/lib/test-utils';
import JobApplicationsPage from './JobApplicationsPage';
import { applicationsApi } from '../../jobs/api/applications.api';

vi.mock('../../jobs/api/applications.api', () => ({
  applicationsApi: {
    getApplicationsForJob: vi.fn(),
    updateApplicationStatus: vi.fn(),
  },
}));

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'job-123' }),
  };
});

describe('JobApplicationsPage', () => {
  const user = userEvent.setup();

  const mockApplications = [
    {
      id: 'app-1',
      jobId: 'job-123',
      workerId: 'worker-1',
      status: 'PENDING',
      appliedAt: '2026-10-14T08:00:00.000Z',
      worker: {
        firstName: 'Alice',
        lastName: 'Smith',
        rating: 4.8,
        experienceYears: 5,
        avatarUrl: '',
      },
    },
    {
      id: 'app-2',
      jobId: 'job-123',
      workerId: 'worker-2',
      status: 'SHORTLISTED',
      appliedAt: '2026-10-14T09:00:00.000Z',
      worker: {
        firstName: 'Bob',
        lastName: 'Jones',
        rating: 4.5,
        experienceYears: 3,
        avatarUrl: '',
      },
    },
    {
      id: 'app-3',
      jobId: 'job-123',
      workerId: 'worker-3',
      status: 'ACCEPTED',
      appliedAt: '2026-10-14T07:00:00.000Z',
      worker: {
        firstName: 'Charlie',
        lastName: 'Brown',
        rating: 4.9,
        experienceYears: 7,
        avatarUrl: '',
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(applicationsApi.getApplicationsForJob).mockResolvedValue({
      items: mockApplications,
      pagination: { total: 3, page: 1, limit: 10, totalPages: 1 },
    });
  });

  it('renders application list with candidate details', async () => {
    customRender(<JobApplicationsPage />);

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Jones')).toBeInTheDocument();
      expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
    });

    expect(screen.getByText('5 Years')).toBeInTheDocument();
    expect(screen.getByText('3 Years')).toBeInTheDocument();
    expect(screen.getByText('7 Years')).toBeInTheDocument();
  });

  it('filters applications by status', async () => {
    customRender(<JobApplicationsPage />);

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    const filterSelect = screen.getByRole('combobox');
    await user.selectOptions(filterSelect, 'SHORTLISTED');

    await waitFor(() => {
      expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
      expect(screen.getByText('Bob Jones')).toBeInTheDocument();
      expect(screen.queryByText('Charlie Brown')).not.toBeInTheDocument();
    });
  });

  it('shows empty state when no candidates match filter', async () => {
    customRender(<JobApplicationsPage />);

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    const filterSelect = screen.getByRole('combobox');
    await user.selectOptions(filterSelect, 'REJECTED');

    expect(screen.getByText('No applications found')).toBeInTheDocument();
    expect(
      screen.getByText('There are no candidates matching the selected filter.'),
    ).toBeInTheDocument();
  });

  it('shortlists a pending candidate', async () => {
    vi.mocked(applicationsApi.updateApplicationStatus).mockResolvedValue({
      ...mockApplications[0],
      status: 'SHORTLISTED',
    });

    customRender(<JobApplicationsPage />);

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    const shortlistBtn = screen.getByRole('button', { name: /shortlist/i });
    await user.click(shortlistBtn);

    await waitFor(() => {
      expect(applicationsApi.updateApplicationStatus).toHaveBeenCalledWith('app-1', {
        status: 'SHORTLISTED',
      });
    });
  });

  it('accepts a shortlisted candidate', async () => {
    vi.mocked(applicationsApi.updateApplicationStatus).mockResolvedValue({
      ...mockApplications[1],
      status: 'ACCEPTED',
    });

    customRender(<JobApplicationsPage />);

    await waitFor(() => {
      expect(screen.getByText('Bob Jones')).toBeInTheDocument();
    });

    const acceptBtn = screen.getByRole('button', { name: /accept/i });
    await user.click(acceptBtn);

    await waitFor(() => {
      expect(applicationsApi.updateApplicationStatus).toHaveBeenCalledWith('app-2', {
        status: 'ACCEPTED',
      });
    });
  });

  it('handles update status failure gracefully', async () => {
    vi.mocked(applicationsApi.updateApplicationStatus).mockRejectedValue(
      new Error('Network error'),
    );

    customRender(<JobApplicationsPage />);

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    const shortlistBtn = screen.getByRole('button', { name: /shortlist/i });
    await user.click(shortlistBtn);

    await waitFor(() => {
      expect(screen.getByText('Failed to update status')).toBeInTheDocument();
    });
  });
});
