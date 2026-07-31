/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument -- TODO(RC3): */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, ArrowLeft, CheckCircle2, Building, IndianRupee } from 'lucide-react';
import { jobsApi } from '../api/jobs.api';
import { applicationsApi } from '../api/applications.api';
import { useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '../../../app/store';
import type { Job } from '@shiftly/shared-types';

export default function JobDetailPage(): React.ReactElement {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const user = useAppSelector((state) => state.auth.user);

  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchJob = async () => {
      setIsLoading(true);
      try {
        const data = await jobsApi.getJobById(id);
        setJob(data);
      } catch (_error: any) {
        console.error('Failed to fetch job', _error);
        setError('Failed to load job details. The job might not exist.');
      } finally {
        setIsLoading(false);
      }
    };

    const checkApplied = async () => {
      try {
        const res = await applicationsApi.checkApplication(id);
        if (res.applied) {
          setApplySuccess(true);
          setApplicationStatus(res.status || null);
          setApplicationId(res.applicationId || null);
        }
      } catch (_error) {
        console.error('Failed to check application status', _error);
      }
    };

    void fetchJob();
    if (user) {
      void checkApplied();
    }
  }, [id, user]);

  const [applyError, setApplyError] = useState<string | null>(null);

  const handleApply = async () => {
    if (!id) return;
    setIsApplying(true);
    setApplyError(null);
    try {
      await applicationsApi.applyToJob({ jobId: id, coverLetter: 'Interested in this role' });
      await queryClient.invalidateQueries({ queryKey: ['worker-applications'] });
      setApplySuccess(true);
      setApplicationStatus('PENDING'); // Optimistic update
    } catch (_error: any) {
      console.error('Failed to apply', _error);

      if (_error?.response?.data?.error?.message) {
        setApplyError(`Error: ${_error.response.data.error.message}`);
      } else if (_error?.response?.data?.message) {
        setApplyError(`Error: ${_error.response.data.message}`);
      } else {
        setApplyError('Failed to apply. Please try again.');
      }
    } finally {
      setIsApplying(false);
    }
  };

  const handleWithdraw = async () => {
    if (!applicationId) return;
    if (!window.confirm('Are you sure you want to withdraw your application?')) return;

    try {
      await applicationsApi.withdrawApplication(applicationId);
      await queryClient.invalidateQueries({ queryKey: ['worker-applications'] });
      await queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setApplicationStatus('WITHDRAWN');
    } catch (_error) {
      console.error('Failed to withdraw application', _error);
      setApplyError('Failed to withdraw application. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-4xl items-center justify-center px-4 py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <button
          className="mx-auto mb-6 flex cursor-pointer items-center rounded-md border-none bg-transparent px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </button>
        <div className="rounded-xl border border-dashed border-border bg-card py-12">
          <p className="text-lg font-medium text-destructive">{error || 'Job not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <button
        className="-ml-4 mb-6 flex cursor-pointer items-center rounded-md border-none bg-transparent px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </button>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {/* Header Section */}
        <div className="border-b border-border p-8">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-foreground">{job.title}</h1>
              <p className="text-lg font-medium text-primary">
                {job.employer?.companyName || job.employerId}
              </p>
            </div>
            <div className="flex w-full flex-col items-end gap-2 md:w-auto">
              {!applySuccess ? (
                <button
                  onClick={() => {
                    void handleApply();
                  }}
                  disabled={isApplying}
                  className="h-12 w-full rounded-lg bg-primary px-8 font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50 md:w-auto"
                >
                  {isApplying ? 'Applying...' : 'Apply for this Job'}
                </button>
              ) : (
                <div className="flex items-center gap-4">
                  {applicationStatus === 'ACCEPTED' && (
                    <span className="flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 font-medium text-green-500">
                      <CheckCircle2 className="h-5 w-5" /> Selected
                    </span>
                  )}
                  {applicationStatus === 'WITHDRAWN' && (
                    <span className="flex items-center gap-2 rounded-full border border-gray-500/20 bg-gray-500/10 px-4 py-2 font-medium text-gray-500">
                      Withdrawn
                    </span>
                  )}
                  {applicationStatus === 'REJECTED' && (
                    <span className="flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 font-medium text-red-500">
                      Rejected
                    </span>
                  )}
                  {applicationStatus === 'COMPLETED' && (
                    <span className="flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 font-medium text-purple-500">
                      Completed
                    </span>
                  )}
                  {(applicationStatus === 'PENDING' ||
                    applicationStatus === 'SHORTLISTED' ||
                    !applicationStatus) && (
                    <span className="flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2 font-medium text-amber-500">
                      {applicationStatus === 'SHORTLISTED' ? 'Shortlisted' : 'Applied Successfully'}
                    </span>
                  )}
                  {(applicationStatus === 'PENDING' ||
                    applicationStatus === 'SHORTLISTED' ||
                    !applicationStatus) && (
                    <button
                      onClick={() => {
                        void handleWithdraw();
                      }}
                      className="text-sm font-medium text-destructive hover:underline"
                    >
                      Cancel Application
                    </button>
                  )}
                </div>
              )}
              {applyError && <p className="text-sm font-medium text-destructive">{applyError}</p>}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="flex items-start text-muted-foreground">
              <MapPin className="mr-3 mt-0.5 h-5 w-5 text-muted-foreground/70" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                  Location
                </p>
                <p className="text-sm font-medium text-foreground">
                  {(job as any).location?.city || 'Remote'}
                </p>
              </div>
            </div>
            <div className="flex items-start text-muted-foreground">
              <Building className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-semibold text-foreground">
                  {(job as any).employer?.companyName || 'Employer Name'}
                </h3>
                <p className="text-sm text-muted-foreground">Logistics & Supply Chain</p>
              </div>
            </div>
            <div className="flex items-start text-muted-foreground">
              <IndianRupee className="mr-3 mt-0.5 h-5 w-5 text-muted-foreground/70" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                  Salary
                </p>
                <p className="text-sm font-medium text-foreground">
                  {(job as any).salaryCurrency} {(job as any).salaryMin} - {(job as any).salaryMax}{' '}
                  / {(job as any).salaryPeriod}
                </p>
              </div>
            </div>
            <div className="flex items-start text-muted-foreground">
              <Clock className="mr-3 mt-0.5 h-5 w-5 text-muted-foreground/70" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                  Posted
                </p>
                <p className="text-sm font-medium text-foreground">
                  {new Date((job as any).createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8">
          <h2 className="mb-4 text-xl font-bold text-foreground">About the Role</h2>
          <div className="prose max-w-none whitespace-pre-wrap text-muted-foreground">
            {job.description}
          </div>

          <div className="mt-8">
            <h2 className="mb-4 text-xl font-bold text-foreground">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {(job as any).skills && (job as any).skills.length > 0 ? (
                (
                  (job as unknown as Record<string, unknown>).skills as {
                    skillId?: string;
                    skill?: { id?: string; name?: string };
                  }[]
                ).map((skillRef) => (
                  <span
                    key={skillRef.skill?.id || skillRef.skillId}
                    className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm font-medium text-foreground"
                  >
                    <CheckCircle2 className="mr-1.5 h-3 w-3 text-primary" />
                    {skillRef.skill?.name || skillRef.skillId}
                  </span>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No specific skills listed.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
