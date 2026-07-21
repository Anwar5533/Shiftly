import React from 'react';
import { ShieldCheck, AlertTriangle, Users, Server, Activity } from 'lucide-react';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/features/admin/api/admin.api';

export default function AdminDashboard(): React.ReactElement {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getDashboardStats(),
  });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            System Administration
          </h1>
          <p className="mt-1 text-muted-foreground">Platform overview and health metrics.</p>
        </div>
      </div>

      {/* Health Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-green-500/10 p-3 text-green-500">
              <Server className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">API Status</p>
              <h3 className="flex items-center gap-2 text-xl font-bold text-green-500">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${stats?.isApiHealthy ? 'animate-pulse bg-green-500' : 'bg-red-500'}`}
                ></span>
                {isLoading ? '...' : stats?.isApiHealthy ? 'Healthy' : 'Down'}
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Users</p>
              <h3 className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : stats?.activeUsers || 0}
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-accent p-3 text-accent-foreground">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Jobs Processed</p>
              <h3 className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : stats?.jobsProcessed || 0}
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-yellow-500/10 p-3 text-yellow-500">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending KYC</p>
              <h3 className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : stats?.pendingKyc || 0}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pending KYC Approvals */}
        <div className="flex h-[400px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border p-6">
            <h2 className="text-lg font-semibold text-foreground">KYC Queue</h2>
            <span className="rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-xs font-semibold text-yellow-600">
              {stats?.pendingKyc || 0} Pending
            </span>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 font-medium">User</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Submitted</th>
                  <th className="px-6 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <tr key={i} className="transition-colors hover:bg-muted/30">
                    <td className="px-6 py-3 font-medium text-foreground">user{i}@example.com</td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {i % 2 === 0 ? 'Worker' : 'Employer'}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">2 hrs ago</td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() =>
                          alert(`Reviewing KYC for user${i}@example.com... (Simulated Action)`)
                        }
                        className="font-medium text-primary hover:underline"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Alerts */}
        <div className="flex h-[400px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border p-6">
            <h2 className="text-lg font-semibold text-foreground">System Alerts</h2>
          </div>
          <div className="flex-1 space-y-3 overflow-auto p-4">
            <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              <div>
                <h4 className="text-sm font-semibold text-destructive">High Latency Detected</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Database query latency on the Jobs cluster has exceeded 500ms for the last 5
                  minutes.
                </p>
                <span className="mt-2 block text-[10px] text-muted-foreground">10 mins ago</span>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
              <div>
                <h4 className="text-sm font-semibold text-yellow-600">Redis Memory Warning</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Redis cache cluster memory usage is at 85%. Consider scaling up.
                </p>
                <span className="mt-2 block text-[10px] text-muted-foreground">1 hr ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
