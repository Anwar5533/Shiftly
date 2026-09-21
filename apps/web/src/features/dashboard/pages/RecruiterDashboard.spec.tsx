import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render as customRender } from '@/shared/lib/test-utils';
import RecruiterDashboard from './RecruiterDashboard';
import { recruiterApi } from '@/features/profile/api/recruiter.api';

// Mock dependencies
vi.mock('@/features/profile/api/recruiter.api', () => ({
  recruiterApi: {
    getDashboardStats: vi.fn(),
  },
}));

describe('RecruiterDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock response
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (recruiterApi.getDashboardStats as any).mockResolvedValue({
      placements: 5,
      totalApplications: 100,
      activeJobs: 10,
      successRate: 5,
    });
  });

  it('renders without crashing', async () => {
    const { container } = customRender(<RecruiterDashboard />);
    expect(container).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getAllByText('100').length).toBeGreaterThan(0); // totalApplications
    });
  });

  it('renders the pipeline funnel chart with correct data', async () => {
    customRender(<RecruiterDashboard />);

    // Wait for the data to populate
    await waitFor(() => {
      // Sourced label and count
      expect(screen.getByText('Sourced')).toBeInTheDocument();
      expect(screen.getAllByText('100').length).toBeGreaterThan(0); // Appears in Active Candidates stats card and Funnel chart

      // Screened label and count (70% of 100)
      expect(screen.getByText('Screened')).toBeInTheDocument();
      expect(screen.getByText('70')).toBeInTheDocument();

      // Interviewing label and count (30% of 100)
      expect(screen.getByText('Interviewing')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();

      // Offered label and count
      expect(screen.getByText('Offered')).toBeInTheDocument();
      expect(screen.getAllByText('5').length).toBeGreaterThan(0); // Appears in Placements stats card and Funnel chart
    });
  });
});
