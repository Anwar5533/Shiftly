/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-misused-promises -- TODO(RC3): */
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { jobsApi } from '../api/jobs.api';

const postJobSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  jobType: z.enum(['PERMANENT', 'SHIFT', 'GIG']),
  locationCity: z.string().min(2, 'City is required'),
  salaryMin: z.coerce.number().min(1, 'Minimum salary is required'),
  salaryMax: z.coerce.number().min(1, 'Maximum salary is required'),
  salaryCurrency: z.string().default('INR'),
  salaryPeriod: z.enum(['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'ANNUAL', 'FIXED']),
  description: z.string().min(20, 'Description must be at least 20 characters'),
});

type PostJobFormValues = z.infer<typeof postJobSchema>;

export default function PostJobPage(): React.ReactElement {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PostJobFormValues>({
    resolver: zodResolver(postJobSchema),
    defaultValues: {
      jobType: 'PERMANENT',
      salaryCurrency: 'INR',
      salaryPeriod: 'ANNUAL',
    },
  });

  const onSubmit = async (data: PostJobFormValues) => {
    try {
      // Map to CreateJobDto format
      const createData = {
        title: data.title,
        description: data.description,
        jobType: data.jobType,
        location: {
          city: data.locationCity,
          state: '', // Default empty for now or add to form
          country: 'India',
          lat: 0,
          lng: 0,
          address: '',
          postalCode: '',
          isRemote: false,
        },
        salaryMin: data.salaryMin,
        salaryMax: data.salaryMax,
        salaryCurrency: data.salaryCurrency,
        salaryPeriod: data.salaryPeriod,
        startDate: new Date().toISOString(), // Dummy start date
        positionsTotal: 1,
      };

      const newJob = await jobsApi.createJob(createData);
      void navigate(`/jobs/${newJob.id}`);
    } catch (_error: any) {
      const err = _error as import('axios').AxiosError<{ error?: { message?: string } }>;
      console.error('Failed to post job', err);
      alert(err.response?.data?.error?.message || 'Failed to post job');
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Post a New Job</h1>
        <p className="mt-1 text-muted-foreground">
          Fill out the details below to publish your job listing.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        type safety
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="title" className="text-sm font-medium text-foreground">Job Title</label>
              <input
                id="title"
                type="text"
                {...register('title')}
                placeholder="e.g. Senior Frontend Developer"
                className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${errors.title ? 'border-destructive' : 'border-input'} input-glow`}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="jobType" className="text-sm font-medium text-foreground">Job Type</label>
              <select
                id="jobType"
                {...register('jobType')}
                className="input-glow flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="PERMANENT">Permanent</option>
                <option value="SHIFT">Shift / Hourly</option>
                <option value="GIG">Gig / Freelance</option>
              </select>
              {errors.jobType && <p className="text-sm text-red-500">{errors.jobType.message}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="locationCity" className="text-sm font-medium text-foreground">City</label>
              <input
                id="locationCity"
                type="text"
                {...register('locationCity')}
                placeholder="e.g. Bangalore"
                className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${errors.locationCity ? 'border-destructive' : 'border-input'} input-glow`}
              />
              {errors.locationCity && (
                <p className="text-sm text-red-500">{errors.locationCity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="salaryMin" className="text-sm font-medium text-foreground">Min Salary</label>
              <input
                id="salaryMin"
                type="number"
                {...register('salaryMin')}
                placeholder="e.g. 1500000"
                className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${errors.salaryMin ? 'border-destructive' : 'border-input'} input-glow`}
              />
              {errors.salaryMin && (
                <p className="text-sm text-red-500">{errors.salaryMin.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="salaryMax" className="text-sm font-medium text-foreground">Max Salary</label>
              <input
                id="salaryMax"
                type="number"
                {...register('salaryMax')}
                placeholder="e.g. 2500000"
                className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${errors.salaryMax ? 'border-destructive' : 'border-input'} input-glow`}
              />
              {errors.salaryMax && (
                <p className="text-sm text-red-500">{errors.salaryMax.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="salaryPeriod" className="text-sm font-medium text-foreground">Salary Period</label>
              <select
                id="salaryPeriod"
                {...register('salaryPeriod')}
                className="input-glow flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="ANNUAL">Per Annum</option>
                <option value="MONTHLY">Per Month</option>
                <option value="HOURLY">Per Hour</option>
                <option value="DAILY">Per Day</option>
                <option value="FIXED">Fixed</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="description" className="text-sm font-medium text-foreground">Job Description</label>
              <textarea
                id="description"
                {...register('description')}
                rows={6}
                placeholder="Describe the responsibilities, requirements, and benefits..."
                className={`input-glow flex w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${errors.description ? 'border-destructive' : 'border-input'}`}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-12 rounded-lg bg-primary px-8 font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Posting...' : 'Publish Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
