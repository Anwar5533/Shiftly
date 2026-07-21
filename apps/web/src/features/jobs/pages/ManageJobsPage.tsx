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
        setJobs(data);
      } catch (err) {
        console.error('Failed to fetch my jobs', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyJobs();
  }, []);

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(job.status);
      return matchesSearch && matchesStatus;
    });
  }, [jobs, searchQuery, selectedStatuses]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Manage Jobs</h1>
          <p className="text-muted-foreground mt-1">View and manage your current job postings.</p>
        </div>
        <button 
          onClick={() => navigate('/jobs/post')}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Post New Job
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-visible">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-muted/50 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-2 px-3 py-2 border border-input rounded-lg text-sm font-medium hover:bg-muted transition-colors text-foreground"
            >
              <Filter className="w-4 h-4" /> Filter
              {selectedStatuses.length > 0 && (
                <span className="ml-1 bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded-full">
                  {selectedStatuses.length}
                </span>
              )}
            </button>
            {showFilter && (
              <div className="absolute right-0 top-10 z-20 bg-card border border-border rounded-lg shadow-lg py-2 w-44">
                <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</p>
                {STATUS_OPTIONS.map(status => (
                  <button
                    key={status}
                    onClick={() => toggleStatus(status)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted transition-colors text-foreground"
                  >
                    <span>{status}</span>
                    {selectedStatuses.includes(status) && <CheckCircle2 className="w-4 h-4 text-primary" />}
                  </button>
                ))}
                {selectedStatuses.length > 0 && (
                  <>
                    <div className="border-t border-border my-1" />
                    <button
                      onClick={() => setSelectedStatuses([])}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-red-500"
                    >
                      <X className="w-3 h-3" /> Clear Filters
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 text-sm text-muted-foreground border-b border-border">
                <th className="p-4 font-medium">Job Title</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Candidates</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">Loading...</td>
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
                    className="hover:bg-muted/10 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/jobs/${job.id}/applications`)}
                  >
                    <td className="p-4">
                      <div className="font-semibold text-foreground">{job.title}</div>
                      <div className="text-sm text-muted-foreground mt-1">{job.jobType} • {job.location?.city || 'Remote'}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        job.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                        job.status === 'DRAFT' ? 'bg-muted text-muted-foreground border-border' :
                        job.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                          <Users className="w-4 h-4 text-muted-foreground" /> {(job as any).applications?.length || 0}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Eye className="w-4 h-4" /> {(job as any).viewCount || 0}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right" onClick={e => e.stopPropagation()}>
                      <button className="p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
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
      {showFilter && (
        <div className="fixed inset-0 z-10" onClick={() => setShowFilter(false)} />
      )}
    </div>
  );
}
