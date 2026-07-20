import { describe, it, expect } from 'vitest';
import { render as customRender } from '../../../shared/lib/test-utils.tsx';
import JobDetailPage from './JobDetailPage';

describe('JobDetailPage', () => {
  it('renders without crashing', () => {
    // Basic render test to ensure component mounts and to cover its execution path
    const { container } = customRender(<JobDetailPage />);
    expect(container).toBeInTheDocument();
  });
});
