import React from 'react';
import { Briefcase, Users, Eye, MoreHorizontal, Plus, Search, Filter } from 'lucide-react';

export default function ManageJobsPage(): React.ReactElement {
  const jobs = [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      type: 'Full-time',
      location: 'Remote',
      status: 'Active',
      applicants: 24,
      views: 342,
      posted: '2 days ago'
    },
    {
      id: 2,
      title: 'Warehouse Manager',
      type: 'Full-time',
      location: 'Seattle, WA',
      status: 'Active',
      applicants: 12,
      views: 156,
      posted: '5 days ago'
    },
    {
      id: 3,
      title: 'Delivery Driver',
      type: 'Contract',
      location: 'Bellevue, WA',
      status: 'Closed',
      applicants: 45,
      views: 890,
      posted: '2 weeks ago'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Manage Jobs</h1>
          <p className="text-muted-foreground mt-1">View and manage your current job postings.</p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 flex items-center justify-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Post New Job
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search jobs..." 
              className="w-full pl-9 pr-4 py-2 bg-muted/50 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-input rounded-lg text-sm font-medium hover:bg-muted transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
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
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-muted/10 transition-colors group">
                  <td className="p-4">
                    <div className="font-semibold text-foreground">{job.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">{job.type} • {job.location}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      job.status === 'Active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-muted text-muted-foreground border-border'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                        <Users className="w-4 h-4 text-muted-foreground" /> {job.applicants}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Eye className="w-4 h-4" /> {job.views}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
