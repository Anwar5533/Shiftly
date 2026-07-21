import { describe, it, expect } from 'vitest';
import authReducer, { setUser, clearUser, setLoading } from './authSlice';
import type { JwtPayload } from '@shiftly/shared-types';

describe('authSlice', () => {
  const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
  };

  it('should return the initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setUser', () => {
    const userPayload = { userId: '1', role: 'WORKER', email: 'test@example.com', sub: '1', permissions: [], sessionId: '', iat: 0, exp: 0 } as unknown as JwtPayload;
    const actual = authReducer(initialState, setUser(userPayload));
    expect(actual.user).toEqual(userPayload);
    expect(actual.isAuthenticated).toBe(true);
    expect(actual.isLoading).toBe(false);
  });

  it('should handle clearUser', () => {
    const loggedInState = {
      user: { userId: '1', role: 'EMPLOYER', email: 'test@example.com', sub: '1', permissions: [], sessionId: '', iat: 0, exp: 0 } as JwtPayload,
      isAuthenticated: true,
      isLoading: true,
    };
    const actual = authReducer(loggedInState, clearUser());
    expect(actual.user).toBeNull();
    expect(actual.isAuthenticated).toBe(false);
    expect(actual.isLoading).toBe(false);
  });

  it('should handle setLoading', () => {
    const actual = authReducer(initialState, setLoading(true));
    expect(actual.isLoading).toBe(true);
  });
});
