import { describe, it, expect } from 'vitest';
import { render as customRender } from '../../../shared/lib/test-utils.tsx';
import EmployerDashboard from './EmployerDashboard';

describe('EmployerDashboard', () => {
  it('renders without crashing', () => {
    // Basic render test to ensure component mounts and to cover its execution path
    const { container } = customRender(<EmployerDashboard />);
    expect(container).toBeInTheDocument();
  });
});
