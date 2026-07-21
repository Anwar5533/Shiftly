import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, MapPin, Briefcase, IndianRupee, X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { jobsApi } from '../api/jobs.api';
import type { Job } from '@shiftly/shared-types';

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
        const response = await jobsApi.searchJobs();
        const fetchedJobs = response.items || (response as any).data || [];
        if (fetchedJobs.length === 0) {
          // Inject mock jobs if database is empty for demo purposes
          setJobs([
            {
              id: 'job-1',
              employerId: 'emp-1',
              title: 'Senior Frontend Developer',
              description: 'We are looking for an experienced frontend developer...',
              skillsRequired: ['React', 'TypeScript', 'Tailwind'],
              jobType: 'PERMANENT',
              location: { city: 'San Francisco', state: 'CA', address: '456 Tech Blvd', country: 'USA', postalCode: '94105', isRemote: false, lat: 37.7749, lng: -122.4194 },
              salaryMin: 1500000,
              salaryMax: 2500000,
              salaryCurrency: 'INR',
              salaryPeriod: 'ANNUAL',
              status: 'PUBLISHED',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            } as unknown as Job,
            {
              id: 'job-2',
              employerId: 'emp-2',
              title: 'Part-time Delivery Partner',
              description: 'Join our delivery network...',
              skillsRequired: ['Driving License', 'Smartphone'],
              jobType: 'GIG',
              location: { city: 'Mumbai', isRemote: false, address: '', country: '', state: '', postalCode: '', lat: 0, lng: 0 },
              salaryMin: 200,
              salaryMax: 500,
              salaryCurrency: 'INR',
              salaryPeriod: 'HOURLY',
              status: 'PUBLISHED',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            } as unknown as Job,
            {
              id: 'job-3',
              employerId: 'emp-1',
              title: 'Full Stack Engineer (Remote)',
              description: 'Looking for a full stack engineer...',
              skillsRequired: ['Node.js', 'React', 'PostgreSQL'],
              jobType: 'PERMANENT',
              location: { city: 'New York', state: 'NY', address: '123 Wall St', country: 'USA', postalCode: '10001', isRemote: false, lat: 40.7128, lng: -74.0060 },
              salaryMin: 2000000,
              salaryMax: 3500000,
              salaryCurrency: 'INR',
              salaryPeriod: 'ANNUAL',
              status: 'PUBLISHED',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            } as unknown as Job
          ]);
        } else {
          setJobs(fetchedJobs);
        }
      } catch (err: any) {
        console.error('Failed to fetch jobs', err);
        setError('Failed to load jobs. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const jobTypes = ['PERMANENT', 'SHIFT', 'GIG'];
  const locations = ['Remote', 'On-site', 'Hybrid']; // Need location filtering logic

  const toggleFilter = (item: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
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
      const matchesLocation = selectedLocations.length === 0 || selectedLocations.includes(isRemote);
      
      return matchesSearch && matchesType && matchesLocation;
    });
  }, [jobs, searchQuery, selectedTypes, selectedLocations]);

  const FilterContent = () => (
    <>
      <div className="mb-6">
        <h3 className="font-semibold text-foreground mb-3">Job Type</h3>
        <div className="space-y-3">
          {jobTypes.map((type) => (
            <label key={type} className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center">
                <input 
                  type="checkbox" 
                  checked={selectedTypes.includes(type)}
                  onChange={() => toggleFilter(type, selectedTypes, setSelectedTypes)}
                  className="peer h-4 w-4 shrink-0 rounded border border-input ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 checked:bg-primary checked:border-primary appearance-none transition-all" 
                />
                <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-0 peer-checked:opacity-100 text-primary-foreground transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{type}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-foreground mb-3">Location</h3>
        <div className="space-y-3">
          {locations.map((loc) => (
            <label key={loc} className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center">
                <input 
                  type="checkbox" 
                  checked={selectedLocations.includes(loc)}
                  onChange={() => toggleFilter(loc, selectedLocations, setSelectedLocations)}
                  className="peer h-4 w-4 shrink-0 rounded border border-input ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 checked:bg-primary checked:border-primary appearance-none transition-all" 
                />
                <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-0 peer-checked:opacity-100 text-primary-foreground transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{loc}</span>
            </label>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 p-2 -ml-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors w-fit"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium text-sm">Back</span>
        </button>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Find Jobs</h1>
          <p className="text-muted-foreground mt-1">Discover opportunities that match your skills.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring input-glow"
            />
          </div>
          <button 
            onClick={() => setIsMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-2 h-10 px-4 py-2 bg-card border border-input text-foreground font-medium rounded-md hover:bg-muted transition-colors shadow-sm"
          >
            <Filter className="w-4 h-4" />
            Filters
            {(selectedTypes.length > 0 || selectedLocations.length > 0) && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground ml-1">
                {selectedTypes.length + selectedLocations.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Filters Sidebar */}
        <div className="hidden lg:block space-y-6">
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
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden" 
              />
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 right-0 w-full max-w-xs bg-card border-l border-border shadow-2xl z-50 p-6 overflow-y-auto lg:hidden"
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-foreground">Filters</h2>
                  <button 
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="p-2 -mr-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <FilterContent />
                
                <div className="mt-8 pt-6 border-t border-border flex gap-3">
                  <button 
                    onClick={() => { setSelectedTypes([]); setSelectedLocations([]); }}
                    className="flex-1 px-4 py-2 bg-muted text-muted-foreground hover:bg-muted/80 rounded-md text-sm font-medium transition-colors"
                  >
                    Clear All
                  </button>
                  <button 
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium transition-colors hover:bg-primary/90 shadow-sm shadow-brand"
                  >
                    Apply
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Jobs List */}
        <div className="lg:col-span-3 space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-card border border-dashed border-border rounded-xl">
              <p className="text-destructive font-medium">{error}</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-16 bg-card border border-dashed border-border rounded-xl">
              <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground">No jobs found</h3>
              <p className="text-muted-foreground mt-1">Try adjusting your search or filters.</p>
              <button 
                onClick={() => { setSearchQuery(''); setSelectedTypes([]); setSelectedLocations([]); }}
                className="mt-4 px-4 py-2 text-sm text-primary font-medium hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div 
                key={job.id} 
                onClick={() => navigate(`/jobs/${job.id}`)}
                className="group bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-brand transition-all cursor-pointer hover:border-primary/50 relative overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{job.title}</h2>
                    <p className="text-primary font-medium mt-1">{job.employerId} (ID)</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shrink-0">
                    {job.jobType}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2 text-muted-foreground/70" />
                    {job.location?.city || 'Remote'}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Briefcase className="w-4 h-4 mr-2 text-muted-foreground/70" />
                    {job.jobType}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <IndianRupee className="w-4 h-4 mr-2 text-muted-foreground/70" />
                    {job.salaryCurrency} {job.salaryMin} - {job.salaryMax} / {job.salaryPeriod}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-border">
                  <span className="text-xs font-medium text-muted-foreground">
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                  <button className="h-9 px-4 bg-primary/10 text-primary font-semibold rounded-md hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
