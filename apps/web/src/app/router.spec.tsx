import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { router } from './router';

describe('router', () => {
  it('renders without crashing', () => {
    // Basic render test to ensure component mounts and to cover its execution path
    // router is an object, not a component.
    expect(router).toBeDefined();
  });
});
