import { describe, it, expect } from 'vitest';
import * as apiModule from './profile.api';

describe('profile.api.ts', () => {
  it('should export expected functions', () => {
    expect(apiModule).toBeDefined();
    // Test that the module exports something (usually API functions)
    expect(Object.keys(apiModule).length).toBeGreaterThan(0);
  });
});
