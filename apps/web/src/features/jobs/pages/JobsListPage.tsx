/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety */
import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, MapPin, Briefcase, IndianRupee, X, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { jobsApi } from '../api/jobs.api';
import type { Job } from '@shiftly/shared-types';
import { useQuery } from '@tanstack/react-query';
import { aiApi } from '../api/ai.api';
import { Sparkles } from 'lucide-react';

const AiMatchBadge = ({ jobId }: { jobId: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['ai-match', jobId],
    queryFn: () => aiApi.getMatchScore(jobId),
    staleTime: 60000,
  });

  if (isLoading || !data) return null;

  let colorClass = 'bg-primary/10 text-primary border-primary/20';
  if (data.score >= 90) colorClass = 'bg-green-500/10 text-green-500 border-green-500/20';
  else if (data.score < 75) colorClass = 'bg-amber-500/10 text-amber-500 border-amber-500/20';

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 ${colorClass}`}
      title={data.reason}
    >
      <Sparkles className="h-3.5 w-3.5" />
      <span className="text-xs font-bold tracking-wide">{data.score}% Match</span>
    </div>
  );
};

export default function JobsListPage(): React.ReactElement {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
        const response = await jobsApi.searchJobs();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
        const fetchedJobs = Array.isArray(response) ? response : response?.items || [];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- TODO(RC3): Address type safety
        setJobs(fetchedJobs);
      } catch (err: any) {
        console.error('Failed to fetch jobs', err);
        setError('Failed to load jobs. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises -- TODO(RC3): Address type safety
    fetchJobs();
  }, []);

  const jobTypes = ['PERMANENT', 'SHIFT', 'GIG'];
  const locations = ['Remote', 'On-site', 'Hybrid']; // Need location filtering logic

  const toggleFilter = (
    item: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(job.jobType);

      // Simple location matching for now
      const isRemote = job.location?.isRemote ? 'Remote' : 'On-site';
      const matchesLocation =
        selectedLocations.length === 0 || selectedLocations.includes(isRemote);

      return matchesSearch && matchesType && matchesLocation;
    });
  }, [jobs, searchQuery, selectedTypes, selectedLocations]);

  const FilterContent = () => (
    <>
      <div className="mb-6">
        <h3 className="mb-3 font-semibold text-foreground">Job Type</h3>
        <div className="space-y-3">
          {jobTypes.map((type) => (
            <label key={type} className="group flex cursor-pointer items-center gap-3">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type)}
                  onChange={() => toggleFilter(type, selectedTypes, setSelectedTypes)}
                  className="peer h-4 w-4 shrink-0 appearance-none rounded border border-input ring-offset-background transition-all checked:border-primary checked:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <svg
                  className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 text-primary-foreground opacity-0 transition-opacity peer-checked:opacity-100"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="text-sm text-muted-foreground transition-colors group-hover:text-foreground">
                {type}
              </span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-3 font-semibold text-foreground">Location</h3>
        <div className="space-y-3">
          {locations.map((loc) => (
            <label key={loc} className="group flex cursor-pointer items-center gap-3">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={selectedLocations.includes(loc)}
                  onChange={() => toggleFilter(loc, selectedLocations, setSelectedLocations)}
                  className="peer h-4 w-4 shrink-0 appearance-none rounded border border-input ring-offset-background transition-all checked:border-primary checked:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <svg
                  className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 text-primary-foreground opacity-0 transition-opacity peer-checked:opacity-100"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="text-sm text-muted-foreground transition-colors group-hover:text-foreground">
                {loc}
              </span>
            </label>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Find Jobs</h1>
          <p className="mt-1 text-muted-foreground">
            Discover opportunities that match your skills.
          </p>
        </div>
        <div className="flex w-full gap-2 md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-glow flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="flex h-10 items-center gap-2 rounded-md border border-input bg-card px-4 py-2 font-medium text-foreground shadow-sm transition-colors hover:bg-muted lg:hidden"
          >
            <Filter className="h-4 w-4" />
            Filters
            {(selectedTypes.length > 0 || selectedLocations.length > 0) && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {selectedTypes.length + selectedLocations.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Desktop Filters Sidebar */}
        <div className="hidden space-y-6 lg:block">
          <FilterContent />
        </div>

        {/* Mobile Filters Drawer */}
        <AnimatePresence>
          {isMobileFiltersOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileFiltersOpen(false)}
                className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 right-0 z-50 w-full max-w-xs overflow-y-auto border-l border-border bg-card p-6 shadow-2xl lg:hidden"
              >
                <div className="mb-8 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground">Filters</h2>
                  <button
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="-mr-2 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <FilterContent />

                <div className="mt-8 flex gap-3 border-t border-border pt-6">
                  <button
                    onClick={() => {
                      setSelectedTypes([]);
                      setSelectedLocations([]);
                    }}
                    className="flex-1 rounded-md bg-muted px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/80"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-brand shadow-sm transition-colors hover:bg-primary/90"
                  >
                    Apply
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Jobs List */}
        <div className="space-y-4 lg:col-span-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center">
              <p className="font-medium text-destructive">{error}</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center">
              <Briefcase className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold text-foreground">No jobs found</h3>
              <p className="mt-1 text-muted-foreground">Try adjusting your search or filters.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTypes([]);
                  setSelectedLocations([]);
                }}
                className="mt-4 px-4 py-2 text-sm font-medium text-primary hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
              className="space-y-4"
            >
              {filteredJobs.map((job) => (
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { type: 'spring', stiffness: 300, damping: 24 },
                    },
                  }}
                  whileHover={{ scale: 1.01 }}
                  key={job.id}
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  className="group relative cursor-pointer overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-brand"
                >
                  <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-foreground transition-colors group-hover:text-primary">
                        {job.title}
                      </h2>
                      <div className="mt-1 flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">
                          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access --
                          TODO(RC3): Address type safety
                          {(job as any).employer?.companyName || 'Employer Name'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="inline-flex shrink-0 items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                        {job.jobType}
                      </span>
                      <AiMatchBadge jobId={job.id} />
                    </div>
                  </div>

                  <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="mr-2 h-4 w-4 text-muted-foreground/70" />
                      {job.location?.city || 'Remote'}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Briefcase className="mr-2 h-4 w-4 text-muted-foreground/70" />
                      {job.jobType}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <IndianRupee className="mr-2 h-4 w-4 text-muted-foreground/70" />
                      {job.salaryCurrency} {job.salaryMin} - {job.salaryMax} / {job.salaryPeriod}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-border pt-4">
                    <span className="text-xs font-medium text-muted-foreground">
                      Posted {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                    <button className="h-9 rounded-md bg-primary/10 px-4 font-semibold text-primary transition-all duration-300 hover:bg-primary hover:text-primary-foreground">
                      View Details
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
