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
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
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
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Welcome back, {user?.email?.split('@')[0] || 'Employer'}
          </h1>
          <p className="text-muted-foreground mt-1">Here's an overview of your hiring operations.</p>
        </div>
        <button 
          onClick={() => navigate('/jobs/post')}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Post a Job
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }} className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Jobs</p>
              <h3 className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : stats?.activeJobs || 0}
              </h3>
            </div>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }} className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent rounded-xl text-accent-foreground">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Applicants</p>
              <h3 className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : stats?.totalApplications || 0}
              </h3>
            </div>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }} className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary rounded-xl text-secondary-foreground">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed Shifts</p>
              <h3 className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : stats?.totalShifts || 0}
              </h3>
            </div>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }} className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-xl text-green-500">
              <TrendingUp className="w-6 h-6" />
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
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Recent Applications</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Candidate</th>
                <th className="px-6 py-4 font-medium">Applied For</th>
                <th className="px-6 py-4 font-medium">Applied On</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
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
                recentApplications?.map((app: any) => (
                  <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                          {app.worker?.firstName?.[0] || 'C'}
                        </div>
                        <span className="font-medium text-foreground">
                          {app.worker?.firstName} {app.worker?.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{app.job?.title}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                        app.status === 'ACCEPTED' ? 'bg-green-500/10 text-green-500' :
                        app.status === 'REJECTED' ? 'bg-red-500/10 text-red-500' :
                        'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => navigate(`/jobs/${app.jobId}/applications`)}
                        className="text-primary hover:underline font-medium"
                      >
                        View Applications
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
