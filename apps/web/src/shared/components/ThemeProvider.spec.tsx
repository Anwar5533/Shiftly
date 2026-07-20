import { describe, it, expect } from 'vitest';
import { render as customRender } from '../lib/test-utils.tsx';
import { ThemeProvider } from './ThemeProvider';

describe('ThemeProvider', () => {
  it('renders without crashing', () => {
    // Basic render test to ensure component mounts and to cover its execution path
    const { container } = customRender(<ThemeProvider />);
    expect(container).toBeInTheDocument();
  });
});
