/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment -- TODO(RC3): */
import React from 'react';
import { Briefcase, IndianRupee, Calendar, ChevronRight } from 'lucide-react';
import { useAppSelector } from '@/app/store';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import { jobsApi } from '../../jobs/api/jobs.api';
import { motion } from 'framer-motion';

export default function WorkerDashboard(): React.ReactElement {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  // Phase 8: Fetch unified dashboard data from the API Gateway (BFF)
  const {
    data: dashboardData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['worker-dashboard', user?.sub],
    queryFn: () => dashboardApi.getWorkerDashboard(),
    enabled: !!user?.sub,
  });

  // We can keep recommended jobs separate since it's not worker-specific profile data,
  // or it could also be moved to the BFF. For now, it stays as is.
  const { data: recommendedResponse, isLoading: isLoadingJobs } = useQuery({
    queryKey: ['worker-recommended-jobs'],
    queryFn: () => jobsApi.searchJobs({ page: 1, limit: 3 }),
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <span className="ml-3 text-lg font-medium text-muted-foreground">Loading dashboard...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-red-500">
        <p>Failed to load dashboard. Please try again later.</p>
      </div>
    );
  }

  const { profile, upcomingShifts = [], pendingApplications = [] } = dashboardData || {};
  const recommendedJobs = (recommendedResponse as any)?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              Welcome back, <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">{profile?.firstName || user?.email?.split('@')[0] || 'Worker'}</span>
            </h1>
            <p className="mt-1 text-muted-foreground font-medium">
              Here is what is happening with your shifts today.
            </p>
          </motion.div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/jobs')}
          className="rounded-xl bg-primary px-6 py-2.5 font-bold text-primary-foreground shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-colors hover:bg-primary/90 hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]"
        >
          Find Shifts
        </motion.button>
      </div>

      {/* Stats Cards */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
        }}
        className="grid grid-cols-1 gap-6 md:grid-cols-3"
      >
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="glass-panel p-6 rounded-2xl relative overflow-hidden group"
        >
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl group-hover:bg-primary/20 transition-colors"></div>
          <div className="flex items-center gap-5 relative z-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-inner border border-primary/10">
              <IndianRupee className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Earnings</p>
              <h3 className="text-3xl font-black text-foreground mt-1">₹{profile?.totalEarnings || 0}</h3>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="glass-panel p-6 rounded-2xl relative overflow-hidden group"
        >
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-accent/10 blur-2xl group-hover:bg-accent/20 transition-colors"></div>
          <div className="flex items-center gap-5 relative z-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 text-accent shadow-inner border border-accent/10">
              <Briefcase className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Active Applications</p>
              <h3 className="text-3xl font-black text-foreground mt-1">{pendingApplications.length}</h3>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="glass-panel p-6 rounded-2xl relative overflow-hidden group"
        >
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl group-hover:bg-blue-500/20 transition-colors"></div>
          <div className="flex items-center gap-5 relative z-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 text-blue-500 shadow-inner border border-blue-500/10">
              <Calendar className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Upcoming Shifts</p>
              <h3 className="text-3xl font-black text-foreground mt-1">{upcomingShifts.length}</h3>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Upcoming Shifts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel overflow-hidden lg:col-span-2"
        >
          <div className="flex items-center justify-between border-b border-white/10 p-6">
            <h2 className="text-lg font-semibold text-foreground">Upcoming Shifts</h2>
            <button
              onClick={() => navigate('/jobs')}
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View all <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="divide-y divide-border">
            {upcomingShifts.length === 0 ? (
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
                      <h4 className="font-semibold text-foreground">
                        {shift.job?.title || 'Shift'}
                      </h4>
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
                      {shift.status?.replace('_', ' ') || 'SCHEDULED'}
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
        </motion.div>

        {/* Recommended Jobs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-panel p-6"
        >
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
                  className="glass-panel group cursor-pointer p-4 transition-colors hover:border-primary/50"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <h4 className="font-medium text-foreground transition-colors group-hover:text-primary">
                      {job.title}
                    </h4>
                    <span className="text-sm font-semibold text-foreground">
                      {job.salaryCurrency === 'INR'
                        ? '₹'
                        : job.salaryCurrency === 'USD'
                          ? '$'
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
        </motion.div>
      </div>
    </div>
  );
}
