import React, { useState, useEffect } from 'react';
import { Users, FileText, Activity, TrendingUp, Plus } from 'lucide-react';
import { useAppSelector } from '@/app/store';
import { useNavigate } from 'react-router-dom';
import type { EmployerDashboardStats } from '../../profile/api/employer.api';
import { employerApi } from '../../profile/api/employer.api';
import { useQuery } from '@tanstack/react-query';
import { applicationsApi } from '../../jobs/api/applications.api';
import { motion } from 'framer-motion';

export default function EmployerDashboard(): React.ReactElement {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [stats, setStats] = useState<EmployerDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (user?.role === 'EMPLOYER') {
          const data = await employerApi.getDashboardStats();
          setStats(data);
        }
      } catch (_error) {
        console.error('Failed to fetch stats', _error);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchStats();
  }, [user]);

  const { data: recentApplications, isLoading: isLoadingApplications } = useQuery({
    queryKey: ['employer-recent-applications'],
    queryFn: () => applicationsApi.getRecentApplications(),
    enabled: user?.role === 'EMPLOYER',
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back, {user?.email?.split('@')[0] || 'Employer'}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Here's an overview of your hiring operations.
          </p>
        </div>
        <button
          onClick={() => navigate('/jobs/post')}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Post a Job
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Jobs</p>
              <h3 className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : stats?.activeJobs || 0}
              </h3>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-accent p-3 text-accent-foreground">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Applicants</p>
              <h3 className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : stats?.totalApplications || 0}
              </h3>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-secondary p-3 text-secondary-foreground">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed Shifts</p>
              <h3 className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : stats?.totalShifts || 0}
              </h3>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-green-500/10 p-3 text-green-500">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Departments</p>
              <h3 className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : stats?.totalDepartments || 0}
              </h3>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Applications */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border p-6">
          <h2 className="text-lg font-semibold text-foreground">Recent Applications</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Candidate</th>
                <th className="px-6 py-4 font-medium">Applied For</th>
                <th className="px-6 py-4 font-medium">Applied On</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoadingApplications ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    Loading applications...
                  </td>
                </tr>
              ) : recentApplications?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No recent applications found.
                  </td>
                </tr>
              ) : (
                recentApplications?.map(
                  (app: {
                    id: string;
                    worker?: Record<string, string>;
                    job?: Record<string, string>;
                    appliedAt: string;
                    status: string;
                    jobId: string;
                  }) => (
                    <tr key={app.id} className="transition-colors hover:bg-muted/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 font-medium text-primary">
                            {app.worker?.firstName?.[0] || 'C'}
                          </div>
                          <span className="font-medium text-foreground">
                            {app.worker?.firstName} {app.worker?.lastName}
                          </span>
                        </div>
                      </td>
                      <td
                        className="max-w-[150px] truncate px-6 py-4 text-muted-foreground"
                        title={app.job?.title}
                      >
                        {app.job?.title}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                            app.status === 'ACCEPTED'
                              ? 'bg-green-500/10 text-green-500'
                              : app.status === 'REJECTED'
                                ? 'bg-red-500/10 text-red-500'
                                : 'bg-yellow-500/10 text-yellow-500'
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => navigate(`/jobs/${app.jobId}/applications`)}
                          className="font-medium text-primary hover:underline"
                        >
                          View Applications
                        </button>
                      </td>
                    </tr>
                  ),
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
