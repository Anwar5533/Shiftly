 
import React from 'react';
import { Target, Users, IndianRupee, Award, ChevronRight } from 'lucide-react';
import { useAppSelector } from '@/app/store';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { recruiterApi } from '@/features/profile/api/recruiter.api';

export default function RecruiterDashboard(): React.ReactElement {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery<{ placements: number; totalApplications: number; activeJobs: number; successRate: number }>({
    queryKey: ['recruiter-dashboard-stats'],
    queryFn: () => recruiterApi.getDashboardStats() as Promise<{ placements: number; totalApplications: number; activeJobs: number; successRate: number }>,
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
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
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
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
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
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
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
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
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
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Pipeline Funnel Placeholder */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Pipeline Overview</h2>
          </div>
          <div className="flex h-[300px] items-end justify-around gap-4 pb-4">
            <div className="group relative h-[80%] w-1/4 rounded-t-lg bg-muted/50 transition-all hover:bg-muted">
              <div className="absolute -top-8 w-full text-center text-sm font-semibold">
                Sourced
              </div>
              <div className="absolute bottom-4 w-full text-center text-lg font-bold">120</div>
            </div>
            <div className="group relative h-[60%] w-1/4 rounded-t-lg bg-primary/20 transition-all hover:bg-primary/30">
              <div className="absolute -top-8 w-full text-center text-sm font-semibold">
                Screened
              </div>
              <div className="absolute bottom-4 w-full text-center text-lg font-bold text-primary">
                85
              </div>
            </div>
            <div className="group relative h-[40%] w-1/4 rounded-t-lg bg-accent/20 transition-all hover:bg-accent/30">
              <div className="absolute -top-8 w-full text-center text-sm font-semibold">
                Interviewing
              </div>
              <div className="absolute bottom-4 w-full text-center text-lg font-bold text-accent-foreground">
                32
              </div>
            </div>
            <div className="group relative h-[20%] w-1/4 rounded-t-lg bg-green-500/20 transition-all hover:bg-green-500/30">
              <div className="absolute -top-8 w-full text-center text-sm font-semibold">
                Offered
              </div>
              <div className="absolute bottom-4 w-full text-center text-lg font-bold text-green-600">
                12
              </div>
            </div>
          </div>
        </div>

        {/* Hot Requirements */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border p-6">
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
              <div key={i} className="rounded-xl border border-border bg-muted/20 p-4">
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
        </div>
      </div>
    </div>
  );
}
