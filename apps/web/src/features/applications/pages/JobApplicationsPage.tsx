/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-floating-promises, @typescript-eslint/no-misused-promises, @typescript-eslint/no-unsafe-argument, @typescript-eslint/require-await, @typescript-eslint/no-base-to-string, @typescript-eslint/prefer-promise-reject-errors, no-useless-assignment -- TODO(RC3): Fix linting issues */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { applicationsApi } from '../../jobs/api/applications.api';
import type { JobApplication } from '../../jobs/api/applications.api';
import { User, Star, Briefcase, BookmarkPlus, Check, X, Filter } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

type ApplicationStatus =
  'PENDING' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN' | 'COMPLETED';

export default function JobApplicationsPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();

  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Status filter state
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'ALL'>('ALL');
  // For updating status dropdown
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchApps = async () => {
      try {
        setIsLoading(true);
        const data = await applicationsApi.getApplicationsForJob(id);
        setApplications(data.items);
      } catch (err) {
        console.error('Failed to load applications.', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApps();
  }, [id]);

  const handleUpdateStatus = async (applicationId: string, newStatus: ApplicationStatus) => {
    try {
      setUpdatingId(applicationId);
      const updatedApp = await applicationsApi.updateApplicationStatus(applicationId, {
        status: newStatus,
      });
      setApplications((prev) => prev.map((app) => (app.id === applicationId ? updatedApp : app)));
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredApplications = applications.filter(
    (app) => statusFilter === 'ALL' || app.status === statusFilter,
  );

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'SHORTLISTED':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'ACCEPTED':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'REJECTED':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'WITHDRAWN':
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      case 'COMPLETED':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Applications</h1>
          <p className="mt-1 text-muted-foreground">Manage candidates for this job posting.</p>
        </div>

        <div className="flex items-center gap-2 rounded-md border border-input bg-card p-1">
          <Filter className="ml-2 h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | 'ALL')}
            className="cursor-pointer border-none bg-transparent py-1.5 pr-8 text-sm font-medium text-foreground outline-none focus:ring-0"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {filteredApplications.length === 0 ? (
          <div className="py-16 text-center">
            <User className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium text-foreground">No applications found</h3>
            <p className="text-muted-foreground">
              There are no candidates matching the selected filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Candidate</th>
                  <th className="px-6 py-4 font-medium">Experience</th>
                  <th className="px-6 py-4 font-medium">Applied</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <AnimatePresence>
                  {filteredApplications.map((app) => (
                    <motion.tr
                      key={app.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {app.worker?.avatarUrl ? (
                            <img
                              src={app.worker.avatarUrl}
                              alt=""
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 font-bold text-primary">
                              {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
                              {app.worker?.firstName?.charAt(0)}
                              {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
                              {app.worker?.lastName?.charAt(0)}
                            </div>
                          )}
                          <div>
                            <span className="block font-medium text-foreground">
                              -- TODO(RC3):                              {app.worker?.firstName} {app.worker?.lastName}
                            </span>
                            <div className="mt-0.5 flex items-center text-xs text-muted-foreground">
                              <Star className="mr-1 h-3 w-3 text-yellow-500" />
                              -- TODO(RC3):                              {app.worker?.rating || 0}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-muted-foreground">
                          <Briefcase className="mr-2 h-4 w-4" />
                          {app.worker?.experienceYears || 0} Years
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${getStatusBadgeColor(app.status)}`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {updatingId === app.id ? (
                          <div className="mr-4 inline-block h-4 w-4 animate-spin rounded-full border-b-2 border-primary"></div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            {app.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(app.id, 'SHORTLISTED')}
                                  className="flex items-center gap-1.5 rounded-md border border-blue-500/20 bg-blue-500/10 px-2.5 py-1.5 text-xs font-medium text-blue-500 transition-colors hover:bg-blue-500/20"
                                  title="Shortlist candidate"
                                >
                                  <BookmarkPlus className="h-3.5 w-3.5" /> Shortlist
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                                  className="flex items-center gap-1.5 rounded-md border border-red-500/20 bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-500/20"
                                  title="Reject candidate"
                                >
                                  <X className="h-3.5 w-3.5" /> Reject
                                </button>
                              </>
                            )}
                            {app.status === 'SHORTLISTED' && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(app.id, 'ACCEPTED')}
                                  className="flex items-center gap-1.5 rounded-md border border-green-500/20 bg-green-500/10 px-2.5 py-1.5 text-xs font-medium text-green-500 transition-colors hover:bg-green-500/20"
                                  title="Accept candidate"
                                >
                                  <Check className="h-3.5 w-3.5" /> Accept
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                                  className="flex items-center gap-1.5 rounded-md border border-red-500/20 bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-500/20"
                                  title="Reject candidate"
                                >
                                  <X className="h-3.5 w-3.5" /> Reject
                                </button>
                              </>
                            )}
                            {['ACCEPTED', 'REJECTED', 'WITHDRAWN', 'COMPLETED'].includes(
                              app.status,
                            ) && (
                              <button
                                className="text-sm font-medium text-primary hover:underline"
                                onClick={() => alert('View full profile functionality coming soon')}
                              >
                                View Profile
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
