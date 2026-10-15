import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { store } from '../../app/store';
import { setUser, clearUser, setLoading } from '../../features/auth/store/authSlice';
import type { JwtPayload } from '@shiftly/shared-types';

describe('ProtectedRoute', () => {
  beforeEach(() => {
    store.dispatch(clearUser());
  });

  it('renders loading state when isLoading is true', () => {
    store.dispatch(setLoading(true));
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects to /login when not authenticated', () => {
    store.dispatch(clearUser());
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('allows access to children when user role matches', () => {
    const workerUser: JwtPayload = {
      sub: 'worker-1',
      role: 'WORKER',
      email: 'worker@test.com',
      sessionId: 'sess-1',
      permissions: [],
    };
    store.dispatch(setUser(workerUser));

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/worker-only']}>
          <Routes>
            <Route
              path="/worker-only"
              element={
                <ProtectedRoute roles={['WORKER', 'SUPER_ADMIN']}>
                  <div>Worker Exclusive Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.getByText('Worker Exclusive Content')).toBeInTheDocument();
  });

  it('redirects to /dashboard when user role does not match allowed roles', () => {
    const workerUser: JwtPayload = {
      sub: 'worker-2',
      role: 'WORKER',
      email: 'worker@test.com',
      sessionId: 'sess-2',
      permissions: [],
    };
    store.dispatch(setUser(workerUser));

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/admin-only']}>
          <Routes>
            <Route path="/dashboard" element={<div>Dashboard Fallback</div>} />
            <Route
              path="/admin-only"
              element={
                <ProtectedRoute roles={['ADMIN', 'SUPER_ADMIN']}>
                  <div>Admin Exclusive Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.getByText('Dashboard Fallback')).toBeInTheDocument();
    expect(screen.queryByText('Admin Exclusive Content')).not.toBeInTheDocument();
  });

  it('allows access to SUPER_ADMIN regardless of specified role', () => {
    const superAdminUser: JwtPayload = {
      sub: 'admin-1',
      role: 'SUPER_ADMIN',
      email: 'superadmin@test.com',
      sessionId: 'sess-3',
      permissions: [],
    };
    store.dispatch(setUser(superAdminUser));

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/employer-only']}>
          <Routes>
            <Route
              path="/employer-only"
              element={
                <ProtectedRoute roles={['EMPLOYER']}>
                  <div>Employer Content for SuperAdmin</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.getByText('Employer Content for SuperAdmin')).toBeInTheDocument();
  });
});

