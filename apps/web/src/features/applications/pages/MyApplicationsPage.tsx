/* eslint-disable @typescript-eslint/no-unsafe-member-access -- TODO(RC3): */
import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  Building,
  MapPin,
  Calendar,
  Clock,
  ChevronRight,
  CheckCircle2,
  Clock3,
  XCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { applicationsApi } from '../../jobs/api/applications.api';
import type { JobApplication } from '../../jobs/api/applications.api';

export default function MyApplicationsPage(): React.ReactElement {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const data = await applicationsApi.getMyApplications();
        setApplications(data.items);
      } catch (_error) {
                console.error('Failed to fetch my applications', _error);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchApps();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return (
          <span className="flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-sm font-medium text-green-500">
            <CheckCircle2 className="h-4 w-4" /> Accepted
          </span>
        );
      case 'SHORTLISTED':
        return (
          <span className="flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-500">
            <Calendar className="h-4 w-4" /> Shortlisted
          </span>
        );
      case 'REJECTED':
        return (
          <span className="flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-sm font-medium text-red-500">
            <XCircle className="h-4 w-4" /> Rejected
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-500">
            <Clock3 className="h-4 w-4" /> Under Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">My Applications</h1>
          <p className="mt-1 text-muted-foreground">
            Track the status of your recent job applications.
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading applications...</div>
        ) : applications.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            You have not applied to any jobs yet.
          </div>
        ) : (
          applications.map((app) => (
            <div
              key={app.id}
              onClick={() => navigate(`/jobs/${app.jobId}`)}
              className="group cursor-pointer rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50"
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                      {app.job?.title || 'Unknown Role'}
                    </h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building className="h-3.5 w-3.5" />                        {app.job?.employer?.companyName || 'Unknown Company'}
                      </span>
                      <span className="hidden text-border md:inline">•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {app.job?.location?.city || 'Remote'}
                      </span>
                      <span className="hidden text-border md:inline">•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> Applied:{' '}
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                        {app.job?.jobType || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 md:mt-0 md:flex-col md:items-end md:gap-4">
                  {getStatusBadge(app.status)}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      void navigate(`/jobs/${app.jobId}`);
                    }}
                    className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 group-hover:underline"
                  >
                    View Details <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
