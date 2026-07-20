import { describe, it, expect } from 'vitest';
import { render as customRender } from '../shared/lib/test-utils.tsx';
import { AuthLayout } from './AuthLayout';

describe('AuthLayout', () => {
  it('renders without crashing', () => {
    // Basic render test to ensure component mounts and to cover its execution path
    const { container } = customRender(<AuthLayout />);
    expect(container).toBeInTheDocument();
  });
});
