/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument -- TODO(RC3): */
import React from 'react';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, Calendar, AlertCircle, FileText } from 'lucide-react';
import { shiftsApi } from '../../jobs/api/shifts.api';

export default function TimesheetsPage(): React.ReactElement {
  // We should actually fetch shifts to see if there is an active one for clock-in/out on this page,
  // but TimesheetsPage is primarily for past/submitted timesheets. Let's stick to the timesheet list here.
  const { data: timesheets = [], isLoading } = useQuery({
    queryKey: ['my-timesheets'],
    queryFn: shiftsApi.getMyTimesheets,
  });

  const handleDownload = () => {
    alert(`Downloading timesheet doc... (mock)`);
  };
  const totalApprovedHours = useMemo(
    () =>
      timesheets

        .filter((ts) => ts.status === 'APPROVED' || ts.status === 'PAID')
        .reduce((acc, ts) => acc + Number(ts.hoursWorked || 0), 0),
    [timesheets],
  );

  const pendingCount = useMemo(
    () => timesheets.filter((ts) => ts.status === 'PENDING' || ts.status === 'SUBMITTED').length,
    [timesheets],
  );

  const actionRequiredCount = useMemo(
    () => timesheets.filter((ts) => ts.status === 'REJECTED').length,
    [timesheets],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Timesheets</h1>
          <p className="mt-1 text-muted-foreground">
            Review your logged hours and payment statuses.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-md bg-indigo-500/10 p-2 text-indigo-500">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="font-medium text-card-foreground">Total Approved Hours</h3>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalApprovedHours.toFixed(1)} hrs</p>
          <p className="mt-1 text-sm text-muted-foreground">Across all approved timesheets</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-md bg-amber-500/10 p-2 text-amber-500">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="font-medium text-card-foreground">Pending Approval</h3>
          </div>
          <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
          <p className="mt-1 text-sm text-muted-foreground">Awaiting employer review</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-md bg-red-500/10 p-2 text-red-500">
              <AlertCircle className="h-5 w-5" />
            </div>
            <h3 className="font-medium text-card-foreground">Action Required</h3>
          </div>
          <p className="text-2xl font-bold text-foreground">{actionRequiredCount}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Timesheets rejected or needing revision
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border bg-muted/30 p-5">
          <h2 className="text-lg font-semibold text-foreground">Recent Timesheets</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-sm text-muted-foreground">
                <th className="p-4 font-medium">Job Title</th>
                <th className="p-4 font-medium">Date Submitted</th>
                <th className="p-4 font-medium">Hours</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-muted-foreground">
                    Loading timesheets...
                  </td>
                </tr>
              ) : timesheets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-muted-foreground">
                    No timesheets found.
                  </td>
                </tr>
              ) : (
                timesheets.map((ts) => (
                  <tr key={ts.id} className="transition-colors hover:bg-muted/30">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {ts.shift?.job?.title || 'Unknown Job'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {ts.submittedAt
                          ? new Date(ts.submittedAt).toLocaleDateString()
                          : 'Pending Submit'}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-foreground">{ts.hoursWorked}h</td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          ts.status === 'APPROVED'
                            ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-500'
                            : ts.status === 'REJECTED'
                              ? 'border border-red-500/20 bg-red-500/10 text-red-500'
                              : 'border border-amber-500/20 bg-amber-500/10 text-amber-500'
                        }`}
                      >
                        {ts.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDownload()}
                        title="View Details"
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
