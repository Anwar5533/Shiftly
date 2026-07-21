import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Briefcase, IndianRupee, Clock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { jobsApi } from '../api/jobs.api';
import type { Job } from '@shiftly/shared-types';

export default function JobDetailPage(): React.ReactElement {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    
    fetchJob();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <button 
          className="mb-6 mx-auto flex items-center px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer rounded-md hover:bg-muted"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        <div className="bg-card border border-dashed border-border rounded-xl py-12">
          <p className="text-destructive font-medium text-lg">{error || 'Job not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <button 
        className="mb-6 -ml-4 flex items-center px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer rounded-md hover:bg-muted"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </button>

      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        {/* Header Section */}
        <div className="p-8 border-b border-border">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{job.title}</h1>
              <p className="text-lg text-primary font-medium">{job.employerId} (ID)</p>
            </div>
            <button className="w-full md:w-auto h-12 px-8 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm">
              Apply for this Job
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="flex items-start text-muted-foreground">
              <MapPin className="w-5 h-5 mr-3 text-muted-foreground/70 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground/70 font-medium uppercase tracking-wider">Location</p>
                <p className="text-sm font-medium text-foreground">{job.location?.city || 'Remote'}</p>
              </div>
            </div>
            <div className="flex items-start text-muted-foreground">
              <Briefcase className="w-5 h-5 mr-3 text-muted-foreground/70 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground/70 font-medium uppercase tracking-wider">Job Type</p>
                <p className="text-sm font-medium text-foreground">{job.jobType}</p>
              </div>
            </div>
            <div className="flex items-start text-muted-foreground">
              <IndianRupee className="w-5 h-5 mr-3 text-muted-foreground/70 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground/70 font-medium uppercase tracking-wider">Salary</p>
                <p className="text-sm font-medium text-foreground">
                  {job.salaryCurrency} {job.salaryMin} - {job.salaryMax} / {job.salaryPeriod}
                </p>
              </div>
            </div>
            <div className="flex items-start text-muted-foreground">
              <Clock className="w-5 h-5 mr-3 text-muted-foreground/70 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground/70 font-medium uppercase tracking-wider">Posted</p>
                <p className="text-sm font-medium text-foreground">
                  {new Date(job.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8">
          <h2 className="text-xl font-bold text-foreground mb-4">About the Role</h2>
          <div className="prose max-w-none text-muted-foreground whitespace-pre-wrap">
            {job.description}
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold text-foreground mb-4">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.skillsRequired && job.skillsRequired.length > 0 ? (
                job.skillsRequired.map(skill => (
                  <span key={skill} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-muted text-foreground">
                    <CheckCircle2 className="w-3 h-3 mr-1.5 text-primary" />
                    {skill}
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
