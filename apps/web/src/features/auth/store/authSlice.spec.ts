import { describe, it, expect } from 'vitest';
import authReducer, { setUser, clearUser, setLoading } from './authSlice';

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
    const userPayload = { userId: '1', role: 'WORKER' as any, email: 'test@example.com' };
    const actual = authReducer(initialState, setUser(userPayload));
    expect(actual.user).toEqual(userPayload);
    expect(actual.isAuthenticated).toBe(true);
    expect(actual.isLoading).toBe(false);
  });

  it('should handle clearUser', () => {
    const loggedInState = {
      user: { userId: '1', role: 'WORKER' as any, email: 'test@example.com' },
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
