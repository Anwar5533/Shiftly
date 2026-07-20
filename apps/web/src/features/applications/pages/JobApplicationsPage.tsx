import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { applicationsApi } from '../api/applications.api';
import type { MockApplication, ApplicationStatus } from '../api/applications.api';
import { User, Star, Briefcase, ChevronDown, Check, X, Filter } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function JobApplicationsPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  
  const [applications, setApplications] = useState<MockApplication[]>([]);
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
        const data = await applicationsApi.getApplicationsByJobId(id);
        setApplications(data);
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
      const updatedApp = await applicationsApi.updateApplicationStatus(applicationId, newStatus);
      setApplications(prev => prev.map(app => app.id === applicationId ? updatedApp : app));
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredApplications = applications.filter(app => 
    statusFilter === 'ALL' || app.status === statusFilter
  );

  const getStatusBadgeColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'SHORTLISTED': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'ACCEPTED': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'REJECTED': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'WITHDRAWN': return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      case 'COMPLETED': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Applications</h1>
          <p className="text-muted-foreground mt-1">Manage candidates for this job posting.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-card border border-input rounded-md p-1">
          <Filter className="w-4 h-4 ml-2 text-muted-foreground" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | 'ALL')}
            className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer outline-none text-foreground py-1.5 pr-8"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {filteredApplications.length === 0 ? (
          <div className="py-16 text-center">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground">No applications found</h3>
            <p className="text-muted-foreground">There are no candidates matching the selected filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 font-medium">Candidate</th>
                  <th className="px-6 py-4 font-medium">Experience</th>
                  <th className="px-6 py-4 font-medium">Applied</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
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
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {app.worker.avatarUrl ? (
                            <img src={app.worker.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                              {app.worker.firstName.charAt(0)}{app.worker.lastName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <span className="font-medium text-foreground block">{app.worker.firstName} {app.worker.lastName}</span>
                            <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                              <Star className="w-3 h-3 text-yellow-500 mr-1" />
                              {app.worker.rating}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-muted-foreground">
                          <Briefcase className="w-4 h-4 mr-2" />
                          {app.worker.experienceYears} Years
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${getStatusBadgeColor(app.status)}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {updatingId === app.id ? (
                          <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-4"></div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            {app.status === 'PENDING' && (
                              <>
                                <button 
                                  onClick={() => handleUpdateStatus(app.id, 'SHORTLISTED')}
                                  className="p-2 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 rounded-md transition-colors"
                                  title="Shortlist"
                                >
                                  <ChevronDown className="w-4 h-4" /> {/* Just an icon for now, ideally an arrow up or similar */}
                                </button>
                                <button 
                                  onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                                  className="p-2 bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded-md transition-colors"
                                  title="Reject"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {app.status === 'SHORTLISTED' && (
                              <>
                                <button 
                                  onClick={() => handleUpdateStatus(app.id, 'ACCEPTED')}
                                  className="p-2 bg-green-500/10 text-green-600 hover:bg-green-500/20 rounded-md transition-colors"
                                  title="Accept"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                                  className="p-2 bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded-md transition-colors"
                                  title="Reject"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {['ACCEPTED', 'REJECTED', 'WITHDRAWN', 'COMPLETED'].includes(app.status) && (
                              <button 
                                className="text-primary hover:underline text-sm font-medium"
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
