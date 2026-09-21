import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardLayout } from './DashboardLayout';
import { render as customRender } from '@/shared/lib/test-utils';
import { authApi } from '@/features/auth/api/auth.api';

// Mock dependencies
vi.mock('@/features/auth/api/auth.api', () => ({
  authApi: {
    logout: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@/features/profile/api/worker.api', () => ({
  workerApi: {
    getProfile: vi.fn().mockResolvedValue({ firstName: 'John', lastName: 'Doe' }),
  },
}));

describe('DashboardLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders without crashing', () => {
    const { container } = customRender(<DashboardLayout />);
    expect(container).toBeInTheDocument();
    expect(screen.getAllByText(/SHIFTLY/).length).toBeGreaterThan(0);
  });

  it('toggles notification dropdown when bell icon is clicked', async () => {
    const user = userEvent.setup();
    customRender(<DashboardLayout />);

    // Notification dropdown should not be visible initially
    expect(screen.queryByText('2 New')).not.toBeInTheDocument();

    const notifBtn = document.querySelector(
      'header button.relative.rounded-full.p-2\\.5',
    ) as HTMLButtonElement;
    expect(notifBtn).toBeInTheDocument();

    await user.click(notifBtn);

    // Now it should be visible
    expect(screen.getByText('2 New')).toBeInTheDocument();
    expect(screen.getByText('Your shift was approved')).toBeInTheDocument();

    // Click again to close
    await user.click(notifBtn);

    await waitFor(() => {
      expect(screen.queryByText('2 New')).not.toBeInTheDocument();
    });
  });

  it('closes notification modal when clicking outside', async () => {
    const user = userEvent.setup();
    customRender(<DashboardLayout />);

    const notifBtn = document.querySelector(
      'header button.relative.rounded-full.p-2\\.5',
    ) as HTMLButtonElement;
    await user.click(notifBtn);
    expect(screen.getByText('2 New')).toBeInTheDocument();

    // Click on the main content area (outside the dropdown)
    const mainContent = document.querySelector('main') as HTMLElement;
    await user.click(mainContent);

    // It should close
    await waitFor(() => {
      expect(screen.queryByText('2 New')).not.toBeInTheDocument();
    });
  });

  it('toggles profile dropdown when profile button is clicked', async () => {
    const user = userEvent.setup();
    customRender(<DashboardLayout />);

    expect(screen.queryByText('View Profile')).not.toBeInTheDocument();

    const profileBtn = screen.getByText('U').closest('button') as HTMLButtonElement;
    expect(profileBtn).toBeInTheDocument();

    await user.click(profileBtn);

    expect(screen.getByText('View Profile')).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();

    // Click outside to close
    const mainContent = document.querySelector('main') as HTMLElement;
    await user.click(mainContent);

    await waitFor(() => {
      expect(screen.queryByText('View Profile')).not.toBeInTheDocument();
    });
  });
});
