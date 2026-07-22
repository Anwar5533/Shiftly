/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-floating-promises, @typescript-eslint/no-misused-promises, @typescript-eslint/no-unsafe-argument, @typescript-eslint/require-await, @typescript-eslint/no-base-to-string, @typescript-eslint/prefer-promise-reject-errors, no-useless-assignment -- TODO(RC3): Fix linting issues */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, ArrowLeft, CheckCircle2, Building, IndianRupee } from 'lucide-react';
import { jobsApi } from '../api/jobs.api';
import { applicationsApi } from '../api/applications.api';
import { useAppSelector } from '../../../app/store';
import type { Job } from '@shiftly/shared-types';

export default function JobDetailPage(): React.ReactElement {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (!id) return;

    const fetchJob = async () => {
      setIsLoading(true);
      try {
        const data = await jobsApi.getJobById(id);
        setJob(data);
      } catch (err: any) {
        console.error('Failed to fetch job', err);
        setError('Failed to load job details. The job might not exist.');
      } finally {
        setIsLoading(false);
      }
    };

    const checkApplied = async () => {
      try {
        const res = await applicationsApi.checkApplication(id);
        if (res.applied) setApplySuccess(true);
      } catch (err) {
        console.error('Failed to check application status', err);
      }
    };

    fetchJob();
    if (user?.role === 'WORKER') {
      checkApplied();
    }
  }, [id, user?.role]);

  const handleApply = async () => {
    if (!id) return;
    setIsApplying(true);
    try {
      await applicationsApi.applyToJob({ jobId: id, coverLetter: 'Interested in this role' });
      setApplySuccess(true);
    } catch (err: any) {
      console.error('Failed to apply', err);

      if (err?.response?.data?.error?.message) {
        alert(`Error: ${err.response.data.error.message}`);
      } else if (err?.response?.data?.message) {
        alert(`Error: ${err.response.data.message}`);
      } else {
        alert('Failed to apply. Please try again.');
      }
    } finally {
      setIsApplying(false);
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
            <button
              onClick={handleApply}
              disabled={isApplying || applySuccess}
              className="h-12 w-full rounded-lg bg-primary px-8 font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50 md:w-auto"
            >
              {isApplying
                ? 'Applying...'
                : applySuccess
                  ? 'Applied Successfully'
                  : 'Apply for this Job'}
            </button>
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
                (job as any).skills.map((skillRef: any) => (
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
