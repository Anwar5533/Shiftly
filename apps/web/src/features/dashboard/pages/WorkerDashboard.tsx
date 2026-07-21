import React from 'react';
import { Briefcase, Clock, IndianRupee, Calendar, ChevronRight } from 'lucide-react';
import { useAppSelector } from '@/app/store';
import { useNavigate } from 'react-router-dom';

export default function WorkerDashboard(): React.ReactElement {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

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
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <IndianRupee className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Earnings this week</p>
              <h3 className="text-2xl font-bold text-foreground">₹35,000.00</h3>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent rounded-xl text-accent-foreground">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Hours worked</p>
              <h3 className="text-2xl font-bold text-foreground">24h 30m</h3>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary rounded-xl text-secondary-foreground">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Upcoming shifts</p>
              <h3 className="text-2xl font-bold text-foreground">3</h3>
            </div>
          </div>
        </div>
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
            {[1, 2, 3].map((i) => (
              <div key={i} onClick={() => navigate(`/jobs/job-${i}`)} className="p-6 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-muted flex flex-col items-center justify-center">
                    <span className="text-xs font-medium text-muted-foreground uppercase">Oct</span>
                    <span className="text-lg font-bold text-foreground">{20 + i}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Warehouse Associate</h4>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Briefcase className="w-3.5 h-3.5" /> Amazon Fulfillment Center
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    Confirmed
                  </span>
                  <p className="text-sm text-muted-foreground mt-2">09:00 AM - 05:00 PM</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Jobs */}
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Recommended for you</h2>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} onClick={() => navigate(`/jobs/job-${i}`)} className="group p-4 border border-border rounded-xl hover:border-primary/50 transition-colors cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">Forklift Operator</h4>
                  <span className="text-sm font-semibold text-foreground">₹1,800/hr</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  Looking for experienced forklift operators for a fast-paced logistics warehouse...
                </p>
                <div className="mt-3 flex gap-2">
                  <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">Logistics</span>
                  <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">Full-time</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
