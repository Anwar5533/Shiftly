import React from 'react';
import { Target, Users, IndianRupee, Award, ChevronRight } from 'lucide-react';
import { useAppSelector } from '@/app/store';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { recruiterApi } from '@/features/profile/api/recruiter.api';

export default function RecruiterDashboard(): React.ReactElement {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['recruiter-dashboard-stats'],
    queryFn: () => recruiterApi.getDashboardStats(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Welcome back, {user?.email?.split('@')[0] || 'Recruiter'}
          </h1>
          <p className="text-muted-foreground mt-1">Here's an overview of your candidate pipeline.</p>
        </div>
        <button 
          onClick={() => navigate('/candidates')}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          Find Candidates
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Placements</p>
              <h3 className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : stats?.placements || 0}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent rounded-xl text-accent-foreground">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Candidates</p>
              <h3 className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : stats?.totalApplications || 0}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary rounded-xl text-secondary-foreground">
              <IndianRupee className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Jobs</p>
              <h3 className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : stats?.activeJobs || 0}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
              <h3 className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : `${stats?.successRate || 0}%`}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Funnel Placeholder */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Pipeline Overview</h2>
          </div>
          <div className="flex h-[300px] items-end justify-around gap-4 pb-4">
            <div className="w-1/4 bg-muted/50 rounded-t-lg relative group h-[80%] transition-all hover:bg-muted">
              <div className="absolute -top-8 w-full text-center text-sm font-semibold">Sourced</div>
              <div className="absolute bottom-4 w-full text-center text-lg font-bold">120</div>
            </div>
            <div className="w-1/4 bg-primary/20 rounded-t-lg relative group h-[60%] transition-all hover:bg-primary/30">
              <div className="absolute -top-8 w-full text-center text-sm font-semibold">Screened</div>
              <div className="absolute bottom-4 w-full text-center text-lg font-bold text-primary">85</div>
            </div>
            <div className="w-1/4 bg-accent/20 rounded-t-lg relative group h-[40%] transition-all hover:bg-accent/30">
              <div className="absolute -top-8 w-full text-center text-sm font-semibold">Interviewing</div>
              <div className="absolute bottom-4 w-full text-center text-lg font-bold text-accent-foreground">32</div>
            </div>
            <div className="w-1/4 bg-green-500/20 rounded-t-lg relative group h-[20%] transition-all hover:bg-green-500/30">
              <div className="absolute -top-8 w-full text-center text-sm font-semibold">Offered</div>
              <div className="absolute bottom-4 w-full text-center text-lg font-bold text-green-600">12</div>
            </div>
          </div>
        </div>

        {/* Hot Requirements */}
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Hot Reqs</h2>
            <button onClick={() => navigate('/jobs')} className="text-sm text-primary font-medium hover:underline">View all</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border border-border rounded-xl bg-muted/20">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-foreground">Senior Nurse (RN)</h4>
                  <span className="text-xs font-bold px-2 py-1 bg-destructive/10 text-destructive rounded-md">Urgent</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">St. Jude's Medical Center</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Fee: <span className="font-semibold text-foreground">15%</span></span>
                  <button onClick={() => navigate(`/jobs/job-${i}`)} className="text-primary font-medium hover:underline flex items-center">
                    Source <ChevronRight className="w-4 h-4" />
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
