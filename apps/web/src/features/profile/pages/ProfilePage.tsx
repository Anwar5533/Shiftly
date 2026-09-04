import React from 'react';
import { useAppSelector } from '@/app/store';
import { Navigate } from 'react-router-dom';
import { Shield, CheckCircle2, Key, Mail, Phone, Activity, Clock, User } from 'lucide-react';
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
      <div className="mx-auto max-w-5xl space-y-8 pb-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {user.role === 'SUPER_ADMIN' ? 'Super Admin Control Center' : 'Admin Dashboard'}
          </h1>
          <p className="mt-1 text-muted-foreground">Manage your system credentials and access levels.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column: Core Identity */}
          <div className="space-y-6 lg:col-span-1">
            <div className="glass-panel p-6 flex flex-col items-center text-center">
              <div className="relative mb-4 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-primary/20 bg-gradient-to-br from-primary/30 to-primary/5">
                <span className="text-5xl font-bold uppercase text-primary">
                  {user.email ? user.email.charAt(0) : 'A'}
                </span>
                <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-background border-4 border-background">
                  <div className="h-4 w-4 rounded-full bg-success animate-pulse" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-foreground break-all">{user.email}</h2>
              <p className="mt-1 flex items-center justify-center gap-1.5 text-sm font-medium text-primary uppercase tracking-widest">
                <Shield className="h-4 w-4" />
                {user.role.replace('_', ' ')}
              </p>
              
              <div className="mt-6 w-full space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-background/50 p-3 text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-semibold text-success flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Active
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-background/50 p-3 text-sm">
                  <span className="text-muted-foreground">Member Since</span>
                  <span className="font-semibold text-foreground">
                    {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Settings & Details */}
          <div className="space-y-6 lg:col-span-2">
            
            {/* Security Section */}
            <div className="glass-panel p-6 card-hover">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-foreground border-b border-border/50 pb-4">
                <Key className="h-5 w-5 text-primary" />
                Security & Verification
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 hover:bg-muted/30 rounded-xl transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-medium text-foreground">Email Address</p>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  <span className="shrink-0 inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success border border-success/20">
                    Verified
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 hover:bg-muted/30 rounded-xl transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Phone Number</p>
                      <p className="text-sm text-muted-foreground">{user.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  {user.phone ? (
                    <span className="shrink-0 inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success border border-success/20">
                      Verified
                    </span>
                  ) : (
                    <button className="text-sm font-medium text-primary hover:underline">Add Phone</button>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 hover:bg-muted/30 rounded-xl transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Key className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Password</p>
                      <p className="text-sm text-muted-foreground">Last changed recently</p>
                    </div>
                  </div>
                  <button className="shrink-0 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                    Update
                  </button>
                </div>
              </div>
            </div>

            {/* Activity Section */}
            <div className="glass-panel p-6 card-hover">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-foreground border-b border-border/50 pb-4">
                <Activity className="h-5 w-5 text-primary" />
                Recent System Activity
              </h3>
              <div className="space-y-4">
                {[
                  { action: 'Logged into Admin Portal', time: 'Just now', ip: '192.168.1.1' },
                  { action: 'Updated system configurations', time: '2 hours ago', ip: '192.168.1.1' },
                  { action: 'Reviewed flagged job posting', time: 'Yesterday', ip: '192.168.1.1' },
                ].map((log, i) => (
                  <div key={i} className="flex items-start justify-between border-l-2 border-primary/30 pl-4">
                    <div>
                      <p className="font-medium text-sm text-foreground">{log.action}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">IP: {log.ip}</p>
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                      <Clock className="h-3 w-3" /> {log.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // Fallback for unknown roles
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="glass-panel p-8 text-center max-w-md">
        <User className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Profile Unavailable</h2>
        <p className="text-muted-foreground">Profile view is not fully implemented for your current role ({user.role}).</p>
      </div>
    </div>
  );
}
