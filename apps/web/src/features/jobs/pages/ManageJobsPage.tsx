/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): */
import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Search, Filter, Users, Eye, MoreHorizontal, X, CheckCircle2 } from 'lucide-react';
import { jobsApi } from '../api/jobs.api';
import type { Job } from '@shiftly/shared-types';
import { useNavigate } from 'react-router-dom';

const STATUS_OPTIONS = ['PUBLISHED', 'DRAFT', 'CANCELLED', 'FILLED'];

export default function ManageJobsPage(): React.ReactElement {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  useEffect(() => {
    const fetchMyJobs = async () => {
      try {
        const data = await jobsApi.getMyJobs();
        setJobs(data.items);
      } catch (err) {
        console.error('Failed to fetch my jobs', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyJobs();
  }, []);

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status],
    );
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(job.status);
      return matchesSearch && matchesStatus;
    });
  }, [jobs, searchQuery, selectedStatuses]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Manage Jobs</h1>
          <p className="mt-1 text-muted-foreground">View and manage your current job postings.</p>
        </div>
        <button
          onClick={() => navigate('/jobs/post')}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Post New Job
        </button>
      </div>

      <div className="overflow-visible rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-border p-4 sm:flex-row sm:items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-input bg-muted/50 py-2 pl-9 pr-4 text-sm text-foreground transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="relative z-50">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-2 rounded-lg border border-input px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Filter className="h-4 w-4" /> Filter
              {selectedStatuses.length > 0 && (
                <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                  {selectedStatuses.length}
                </span>
              )}
            </button>
            {showFilter && (
              <div className="absolute right-0 top-10 z-20 w-44 rounded-lg border border-border bg-card py-2 shadow-lg">
                <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Status
                </p>
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    onClick={() => toggleStatus(status)}
                    className="flex w-full items-center justify-between px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    <span>{status}</span>
                    {selectedStatuses.includes(status) && (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
                {selectedStatuses.length > 0 && (
                  <>
                    <div className="my-1 border-t border-border" />
                    <button
                      onClick={() => setSelectedStatuses([])}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 transition-colors hover:bg-muted"
                    >
                      <X className="h-3 w-3" /> Clear Filters
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-sm text-muted-foreground">
                <th className="p-4 font-medium">Job Title</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Candidates</th>
                <th className="p-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    {jobs.length === 0 ? 'No jobs posted yet.' : 'No jobs match your filters.'}
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr
                    key={job.id}
                    className="group cursor-pointer transition-colors hover:bg-muted/10"
                    onClick={() => navigate(`/jobs/${job.id}/applications`)}
                  >
                    <td className="p-4">
                      <div className="font-semibold text-foreground max-w-[200px] md:max-w-[400px] truncate" title={job.title}>
                        {job.title}
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground max-w-[200px] md:max-w-[400px] truncate">
                        {job.jobType} • {job.location?.city || 'Remote'}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                          job.status === 'PUBLISHED'
                            ? 'border-green-500/20 bg-green-500/10 text-green-500'
                            : job.status === 'DRAFT'
                              ? 'border-border bg-muted text-muted-foreground'
                              : job.status === 'CANCELLED'
                                ? 'border-red-500/20 bg-red-500/10 text-red-500'
                                : 'border-amber-500/20 bg-amber-500/10 text-amber-500'
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {(job as any).applications?.length || 0}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Eye className="h-4 w-4" /> {(job as any).viewCount || 0}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Click away to close filter */}
      {showFilter && <div className="fixed inset-0 z-10" onClick={() => setShowFilter(false)} />}
    </div>
  );
}
