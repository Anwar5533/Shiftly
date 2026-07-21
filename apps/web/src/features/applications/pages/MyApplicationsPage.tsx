import React from 'react';
import { Briefcase, Building, MapPin, Calendar, Clock, ChevronRight, CheckCircle2, Clock3, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MyApplicationsPage(): React.ReactElement {
  const navigate = useNavigate();
  const applications = [
    {
      id: 1,
      jobId: 'job-1',
      role: 'Warehouse Associate',
      company: 'Amazon Fulfillment',
      location: 'Seattle, WA',
      appliedDate: '2026-07-18',
      status: 'Interview Scheduled',
      salary: '$22/hr',
      type: 'Full-time'
    },
    {
      id: 2,
      jobId: 'job-2',
      role: 'Delivery Driver',
      company: 'FedEx Logistics',
      location: 'Bellevue, WA',
      appliedDate: '2026-07-15',
      status: 'Under Review',
      salary: '$24/hr',
      type: 'Contract'
    },
    {
      id: 3,
      jobId: 'job-3',
      role: 'Forklift Operator',
      company: 'Home Depot',
      location: 'Renton, WA',
      appliedDate: '2026-07-10',
      status: 'Rejected',
      salary: '$26/hr',
      type: 'Full-time'
    },
    {
      id: 4,
      jobId: 'job-1',
      role: 'Inventory Specialist',
      company: 'Target Distribution',
      location: 'Kent, WA',
      appliedDate: '2026-07-05',
      status: 'Offered',
      salary: '$25/hr',
      type: 'Part-time'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Offered':
        return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-sm font-medium border border-green-500/20"><CheckCircle2 className="w-4 h-4" /> Offered</span>;
      case 'Interview Scheduled':
        return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-sm font-medium border border-blue-500/20"><Calendar className="w-4 h-4" /> Interview</span>;
      case 'Rejected':
        return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-sm font-medium border border-red-500/20"><XCircle className="w-4 h-4" /> Rejected</span>;
      default:
        return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-sm font-medium border border-amber-500/20"><Clock3 className="w-4 h-4" /> Under Review</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">My Applications</h1>
          <p className="text-muted-foreground mt-1">Track the status of your recent job applications.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {applications.map((app) => (
          <div key={app.id} onClick={() => navigate(`/jobs/${app.jobId}`)} className="bg-card border border-border p-5 rounded-xl hover:border-primary/50 transition-colors cursor-pointer group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{app.role}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5" /> {app.company}</span>
                    <span className="hidden md:inline text-border">•</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {app.location}</span>
                    <span className="hidden md:inline text-border">•</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Applied: {app.appliedDate}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="px-2.5 py-1 rounded-md bg-muted text-xs font-medium text-foreground">{app.type}</span>
                    <span className="px-2.5 py-1 rounded-md bg-muted text-xs font-medium text-foreground">{app.salary}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:flex-col md:items-end gap-3 md:gap-4 mt-4 md:mt-0">
                {getStatusBadge(app.status)}
                <button onClick={(e) => { e.stopPropagation(); navigate(`/jobs/${app.jobId}`); }} className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 group-hover:underline">
                  View Details <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
