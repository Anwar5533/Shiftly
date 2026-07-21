import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, Calendar, AlertCircle, FileText } from 'lucide-react';
import { shiftsApi } from '../../jobs/api/shifts.api';

export default function TimesheetsPage(): React.ReactElement {
  // We should actually fetch shifts to see if there is an active one for clock-in/out on this page, 
  // but TimesheetsPage is primarily for past/submitted timesheets. Let's stick to the timesheet list here.
  const { data: timesheets = [], isLoading } = useQuery({
    queryKey: ['my-timesheets'],
    queryFn: shiftsApi.getMyTimesheets
  });

  const handleDownload = () => {
    alert(`Downloading timesheet doc... (mock)`);
  };

  const totalApprovedHours = timesheets
    .filter(ts => ts.status === 'APPROVED' || ts.status === 'PAID')
    .reduce((acc, ts) => acc + Number(ts.hoursWorked || 0), 0);

  const pendingCount = timesheets.filter(ts => ts.status === 'PENDING' || ts.status === 'SUBMITTED').length;
  const actionRequiredCount = timesheets.filter(ts => ts.status === 'REJECTED').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Timesheets</h1>
          <p className="text-muted-foreground mt-1">Review your logged hours and payment statuses.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-md bg-indigo-500/10 text-indigo-500">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-card-foreground">Total Approved Hours</h3>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalApprovedHours.toFixed(1)} hrs</p>
          <p className="text-sm text-muted-foreground mt-1">Across all approved timesheets</p>
        </div>
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-md bg-amber-500/10 text-amber-500">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-card-foreground">Pending Approval</h3>
          </div>
          <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
          <p className="text-sm text-muted-foreground mt-1">Awaiting employer review</p>
        </div>
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-md bg-red-500/10 text-red-500">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-card-foreground">Action Required</h3>
          </div>
          <p className="text-2xl font-bold text-foreground">{actionRequiredCount}</p>
          <p className="text-sm text-muted-foreground mt-1">Timesheets rejected or needing revision</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-border flex items-center justify-between bg-muted/30">
          <h2 className="font-semibold text-lg text-foreground">Recent Timesheets</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-sm text-muted-foreground">
                <th className="p-4 font-medium">Job Title</th>
                <th className="p-4 font-medium">Date Submitted</th>
                <th className="p-4 font-medium">Hours</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">Loading timesheets...</td></tr>
              ) : timesheets.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No timesheets found.</td></tr>
              ) : timesheets.map((ts) => (
                <tr key={ts.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{ts.shift?.job?.title || 'Unknown Job'}</span>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {ts.submittedAt ? new Date(ts.submittedAt).toLocaleDateString() : 'Pending Submit'}
                    </div>
                  </td>
                  <td className="p-4 font-medium text-foreground">{ts.hoursWorked}h</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      ts.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                      ts.status === 'REJECTED' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                      'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    }`}>
                      {ts.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDownload()}
                      title="View Details"
                      className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                    >
                      <FileText className="w-4 h-4" />
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
