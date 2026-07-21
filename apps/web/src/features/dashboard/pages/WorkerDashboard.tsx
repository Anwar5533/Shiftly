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
      } catch (error) {
        console.error('Failed to fetch stats', error);
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

  const upcomingShifts = shifts?.filter(shift => shift.status === 'SCHEDULED' || shift.status === 'IN_PROGRESS').slice(0, 3) || [];
  const recommendedJobs = recommendedResponse?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Welcome back, {user?.email?.split('@')[0] || 'Worker'}
          </h1>
          <p className="text-muted-foreground mt-1">Here is what is happening with your shifts today.</p>
        </div>
        <button 
          onClick={() => navigate('/jobs')}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          Find Shifts
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }} className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <IndianRupee className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
              <h3 className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : `₹${stats?.totalEarnings || 0}`}
              </h3>
            </div>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }} className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent rounded-xl text-accent-foreground">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Applications</p>
              <h3 className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : stats?.activeApplications || 0}
              </h3>
            </div>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }} className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary rounded-xl text-secondary-foreground">
              <Calendar className="w-6 h-6" />
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Shifts */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Upcoming Shifts</h2>
            <button onClick={() => navigate('/jobs')} className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-border">
            {isLoadingApps ? (
              <div className="p-6 text-center text-muted-foreground">Loading shifts...</div>
            ) : upcomingShifts.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">No upcoming confirmed shifts.</div>
            ) : (
              upcomingShifts.map((shift: any) => (
                <div key={shift.id} onClick={() => navigate(`/shifts/${shift.id}`)} className="p-6 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-muted flex flex-col items-center justify-center">
                      <span className="text-xs font-medium text-muted-foreground uppercase">
                        {new Date(shift.scheduledStart).toLocaleString('default', { month: 'short' })}
                      </span>
                      <span className="text-lg font-bold text-foreground">
                        {new Date(shift.scheduledStart).getDate() || '--'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{shift.job?.title}</h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Briefcase className="w-3.5 h-3.5" /> {shift.job?.employer?.companyName || 'Employer'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${shift.status === 'IN_PROGRESS' ? 'bg-primary/10 text-primary border border-primary/20 animate-pulse' : 'bg-green-500/10 text-green-600'}`}>
                      {shift.status.replace('_', ' ')}
                    </span>
                    <p className="text-sm text-muted-foreground mt-2">
                      {new Date(shift.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recommended Jobs */}
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Recommended for you</h2>
          <div className="space-y-4">
            {isLoadingJobs ? (
              <div className="text-center text-muted-foreground py-4">Loading...</div>
            ) : recommendedJobs.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">No recommendations yet.</div>
            ) : (
              recommendedJobs.map((job: any) => (
                <div key={job.id} onClick={() => navigate(`/jobs/${job.id}`)} className="group p-4 border border-border rounded-xl hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">{job.title}</h4>
                    <span className="text-sm font-semibold text-foreground">
                      {job.salaryCurrency === 'INR' ? '₹' : job.salaryCurrency === 'USD' ? '$' : job.salaryCurrency}
                      {job.salaryMax}/{job.salaryPeriod === 'HOURLY' ? 'hr' : 'mo'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {job.description}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">{job.location?.city || 'Remote'}</span>
                    <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">{job.jobType}</span>
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
