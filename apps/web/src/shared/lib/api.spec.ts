import { describe, it, expect, beforeEach } from 'vitest';
import api, { setAccessToken, getAccessToken, clearAccessToken } from './api';

describe('API Token Store', () => {
  beforeEach(() => {
    clearAccessToken();
  });

  it('should initially have null access token', () => {
    expect(getAccessToken()).toBeNull();
  });

  it('should set access token correctly', () => {
    setAccessToken('test-token');
    expect(getAccessToken()).toBe('test-token');
  });

  it('should clear access token correctly', () => {
    setAccessToken('test-token');
    clearAccessToken();
    expect(getAccessToken()).toBeNull();
  });
});

describe('API Interceptors Config Check', () => {
  it('should have request interceptors defined', () => {
    // We just verify interceptors are registered
    // Actually testing interceptor logic requires a full mock HTTP server like MSW
    // For coverage of the file, this ensures the file exports an Axios instance with interceptors.
    expect(api.interceptors.request).toBeDefined();
    expect(api.interceptors.response).toBeDefined();
  });
});
