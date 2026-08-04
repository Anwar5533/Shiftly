import { describe, it, expect, vi } from 'vitest';
import { render as customRender } from '../../../shared/lib/test-utils.tsx';
import TimesheetsPage from './TimesheetsPage';


vi.mock('../../jobs/api/shifts.api', () => ({
  shiftsApi: {
    getMyTimesheets: vi.fn().mockResolvedValue([]),
  },
}));

describe('TimesheetsPage', () => {
  it('renders without crashing', () => {
    // Basic render test to ensure component mounts and to cover its execution path
    const { container } = customRender(<TimesheetsPage />);
    expect(container).toBeInTheDocument();
  });
});
