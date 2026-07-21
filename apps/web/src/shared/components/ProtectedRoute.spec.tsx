import { describe, it, expect } from 'vitest';
import { render as customRender } from '../lib/test-utils.tsx';
import { ProtectedRoute } from './ProtectedRoute';

describe('ProtectedRoute', () => {
  it('renders without crashing', () => {
    // Basic render test to ensure component mounts and to cover its execution path
    const { container } = customRender(
      <ProtectedRoute>
        <div />
      </ProtectedRoute>,
    );
    expect(container).toBeInTheDocument();
  });
});
