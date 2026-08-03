import React from 'react';
import { useAppSelector } from '@/app/store';
import { Navigate } from 'react-router-dom';
import WorkerProfilePage from './WorkerProfilePage';
import EmployerProfilePage from './EmployerProfilePage';
import RecruiterProfilePage from './RecruiterProfilePage';

export default function ProfilePage(): React.ReactElement {
  const { user } = useAppSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/auth/login" />;
  }

  // Get active portal, default to role-based if not set
  const activePortal =
    localStorage.getItem('activePortal') || (user.role === 'EMPLOYER' ? 'employer' : 'worker');

  // Render different profile views based on user role and active portal
  if (user.role === 'WORKER') {
    return <WorkerProfilePage />;
  }

  if (user.role === 'EMPLOYER') {
    if (activePortal === 'employer') {
      return (
        <div className="space-y-12 pb-12">
          <EmployerProfilePage />
          <div className="mx-auto max-w-5xl border-t border-border" />
          <WorkerProfilePage />
        </div>
      );
    }
    // If employer is in worker portal, only show personal profile
    return <WorkerProfilePage />;
  }

  if (user.role === 'RECRUITER') {
    return <RecruiterProfilePage />;
  }

  if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-3xl font-bold tracking-tight text-foreground">
          {user.role === 'SUPER_ADMIN' ? 'Super Admin Profile' : 'Admin Profile'}
        </h1>
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-lg font-medium text-foreground">{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <p className="text-lg font-medium text-foreground">{user.phone}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Role</p>
              <span className="mt-1 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-semibold text-primary">
                {user.role}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback for unknown roles
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <p className="text-muted-foreground">Profile view not implemented for this role.</p>
    </div>
  );
}
