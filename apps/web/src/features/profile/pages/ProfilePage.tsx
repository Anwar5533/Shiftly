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

  // Render different profile views based on user role
  if (user.role === 'WORKER') {
    return <WorkerProfilePage />;
  }

  if (user.role === 'EMPLOYER') {
    return <EmployerProfilePage />;
  }

  if (user.role === 'RECRUITER') {
    return <RecruiterProfilePage />;
  }

  // Fallback for unknown roles
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <p className="text-muted-foreground">Profile view not implemented for this role.</p>
    </div>
  );
}
