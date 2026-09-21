import React from 'react';
import { motion } from 'framer-motion';
import { Target, Users, IndianRupee, Award, ChevronRight } from 'lucide-react';
import { useAppSelector } from '@/app/store';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { recruiterApi } from '@/features/profile/api/recruiter.api';

export default function RecruiterDashboard(): React.ReactElement {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery<{
    placements: number;
    totalApplications: number;
    activeJobs: number;
    successRate: number;
  }>({
    queryKey: ['recruiter-dashboard-stats'],
    queryFn: () =>
      recruiterApi.getDashboardStats() as Promise<{
        placements: number;
        totalApplications: number;
        activeJobs: number;
        successRate: number;
      }>,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back, {user?.email?.split('@')[0] || 'Recruiter'}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Here's an overview of your candidate pipeline.
          </p>
        </div>
        <button
          onClick={() => navigate('/candidates')}
          className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          Find Candidates
        </button>
      </div>

      {/* Stats Cards */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
        }}
        className="grid grid-cols-1 gap-6 md:grid-cols-4"
      >
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="glass-panel p-6"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Placements</p>
              <h3 className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : stats?.placements || 0}
              </h3>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="glass-panel p-6"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-accent p-3 text-accent-foreground">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Candidates</p>
              <h3 className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : stats?.totalApplications || 0}
              </h3>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="glass-panel p-6"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-secondary p-3 text-secondary-foreground">
              <IndianRupee className="h-6 w-6" />
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
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="glass-panel p-6"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-yellow-500/10 p-3 text-yellow-500">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
              <h3 className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : `${Number(stats?.successRate || 0)}%`}
              </h3>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Pipeline Funnel Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel p-6 lg:col-span-2"
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Pipeline Overview</h2>
          </div>
          <div className="flex h-[300px] items-end justify-around gap-4 pb-4">
            {[
              {
                label: 'Sourced',
                count: stats?.totalApplications || 0,
                bgClass: 'bg-blue-500/20 hover:bg-blue-500/30',
                textClass: 'text-blue-600 dark:text-blue-400',
              },
              {
                label: 'Screened',
                count: Math.floor((stats?.totalApplications || 0) * 0.7),
                bgClass: 'bg-purple-500/20 hover:bg-purple-500/30',
                textClass: 'text-purple-600 dark:text-purple-400',
              },
              {
                label: 'Interviewing',
                count: Math.floor((stats?.totalApplications || 0) * 0.3),
                bgClass: 'bg-orange-500/20 hover:bg-orange-500/30',
                textClass: 'text-orange-600 dark:text-orange-400',
              },
              {
                label: 'Offered',
                count: stats?.placements || 0,
                bgClass: 'bg-green-500/20 hover:bg-green-500/30',
                textClass: 'text-green-600 dark:text-green-400',
              },
            ].map((stage, index, arr) => {
              const maxCount = Math.max(1, ...arr.map((s) => s.count)); // at least 1 to avoid NaN division
              const heightPercent = Math.max((stage.count / maxCount) * 100, 20); // at least 20% height

              return (
                <div
                  key={stage.label}
                  className={`group relative w-1/4 rounded-t-lg transition-all ${stage.bgClass}`}
                  style={{ height: `${heightPercent}%` }}
                >
                  <div className="absolute -top-8 w-full text-center text-sm font-semibold text-foreground">
                    {stage.label}
                  </div>
                  <div
                    className={`absolute bottom-4 w-full text-center text-lg font-bold ${stage.textClass}`}
                  >
                    {stage.count}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Hot Requirements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-panel flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-white/10 p-6">
            <h2 className="text-lg font-semibold text-foreground">Hot Reqs</h2>
            <button
              onClick={() => navigate('/jobs')}
              className="text-sm font-medium text-primary hover:underline"
            >
              View all
            </button>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-panel p-4">
                <div className="mb-2 flex items-start justify-between">
                  <h4 className="font-semibold text-foreground">Senior Nurse (RN)</h4>
                  <span className="rounded-md bg-destructive/10 px-2 py-1 text-xs font-bold text-destructive">
                    Urgent
                  </span>
                </div>
                <p className="mb-3 text-sm text-muted-foreground">St. Jude's Medical Center</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Fee: <span className="font-semibold text-foreground">15%</span>
                  </span>
                  <button
                    onClick={() => navigate(`/jobs/job-${i}`)}
                    className="flex items-center font-medium text-primary hover:underline"
                  >
                    Source <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
