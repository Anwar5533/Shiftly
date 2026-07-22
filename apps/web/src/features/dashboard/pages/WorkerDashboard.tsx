/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-floating-promises, @typescript-eslint/no-unsafe-assignment -- TODO(RC3): */
import React, { useState, useEffect } from 'react';
import { Briefcase, IndianRupee, Calendar, ChevronRight } from 'lucide-react';
import { useAppSelector } from '@/app/store';
import { useNavigate } from 'react-router-dom';
import { workerApi } from '../../profile/api/worker.api';
import type { WorkerDashboardStats } from '../../profile/api/worker.api';
import { useQuery } from '@tanstack/react-query';
import { jobsApi } from '../../jobs/api/jobs.api';
import { shiftsApi } from '../../jobs/api/shifts.api';
import { motion } from 'framer-motion';

export default function WorkerDashboard(): React.ReactElement {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [stats, setStats] = useState<WorkerDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await workerApi.getDashboardStats();
        setStats(data);
      } catch (_error) {
        const error = _error as import('axios').AxiosError<Record<string, unknown>>;
        console.error('Failed to fetch stats', _error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const { data: shifts, isLoading: isLoadingApps } = useQuery({
    queryKey: ['worker-upcoming-shifts'],
    queryFn: () => shiftsApi.getMyShifts(),
  });

  const { data: recommendedResponse, isLoading: isLoadingJobs } = useQuery({
    queryKey: ['worker-recommended-jobs'],
    queryFn: () => jobsApi.searchJobs({ page: 1, limit: 3 }),
  });

  const upcomingShifts =
    shifts
      ?.filter((shift) => shift.status === 'SCHEDULED' || shift.status === 'IN_PROGRESS')
      .slice(0, 3) || [];

  const recommendedJobs = recommendedResponse?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back, {user?.email?.split('@')[0] || 'Worker'}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Here is what is happening with your shifts today.
          </p>
        </div>
        <button
          onClick={() => navigate('/jobs')}
          className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          Find Shifts
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <IndianRupee className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
              <h3 className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : `₹${stats?.totalEarnings || 0}`}
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
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Applications</p>
              <h3 className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : stats?.activeApplications || 0}
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
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed Shifts</p>
              <h3 className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : stats?.completedShifts || 0}
              </h3>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Upcoming Shifts */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border p-6">
            <h2 className="text-lg font-semibold text-foreground">Upcoming Shifts</h2>
            <button
              onClick={() => navigate('/jobs')}
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View all <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="divide-y divide-border">
            {isLoadingApps ? (
              <div className="p-6 text-center text-muted-foreground">Loading shifts...</div>
            ) : upcomingShifts.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                No upcoming confirmed shifts.
              </div>
            ) : (
              upcomingShifts.map((shift: any) => (
                <div
                  key={shift.id}

                  onClick={() => navigate(`/shifts/${shift.id}`)}
                  className="flex cursor-pointer items-center justify-between p-6 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-muted">
                      <span className="text-xs font-medium uppercase text-muted-foreground">
                        {new Date(shift.scheduledStart).toLocaleString('default', {
                          month: 'short',
                        })}
                      </span>
                      <span className="text-lg font-bold text-foreground">
                        {new Date(shift.scheduledStart).getDate() || '--'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{shift.job?.title}</h4>
                      <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <Briefcase className="h-3.5 w-3.5" />{' '}
                        {shift.job?.employer?.companyName || 'Employer'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${shift.status === 'IN_PROGRESS' ? 'animate-pulse border border-primary/20 bg-primary/10 text-primary' : 'bg-green-500/10 text-green-600'}`}
                    >
                      {shift.status.replace('_', ' ')}
                    </span>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {new Date(shift.scheduledStart).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recommended Jobs */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Recommended for you</h2>
          <div className="space-y-4">
            {isLoadingJobs ? (
              <div className="py-4 text-center text-muted-foreground">Loading...</div>
            ) : recommendedJobs.length === 0 ? (
              <div className="py-4 text-center text-muted-foreground">No recommendations yet.</div>
            ) : (
              recommendedJobs.map((job: any) => (
                <div
                  key={job.id}

                  onClick={() => navigate(`/jobs/${job.id}`)}
                  className="group cursor-pointer rounded-xl border border-border p-4 transition-colors hover:border-primary/50"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <h4 className="font-medium text-foreground transition-colors group-hover:text-primary">
                      {job.title}
                    </h4>
                    <span className="text-sm font-semibold text-foreground">
                      {job.salaryCurrency === 'INR'
                        ? '₹'
                        : job.salaryCurrency === 'USD'
                          ? '₹'
                          : job.salaryCurrency}
                      {job.salaryMax}/{job.salaryPeriod === 'HOURLY' ? 'hr' : 'mo'}
                    </span>
                  </div>

                  <p className="line-clamp-2 text-xs text-muted-foreground">{job.description}</p>
                  <div className="mt-3 flex gap-2">
                    <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                      {job.location?.city || 'Remote'}
                    </span>
                    <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                      {job.jobType}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
