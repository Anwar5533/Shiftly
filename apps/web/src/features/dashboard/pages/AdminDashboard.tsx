import React from 'react';
import { ShieldCheck, AlertTriangle, Users, Server, Activity } from 'lucide-react';

export default function AdminDashboard(): React.ReactElement {


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            System Administration
          </h1>
          <p className="text-muted-foreground mt-1">Platform overview and health metrics.</p>
        </div>
      </div>

      {/* Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-xl text-green-500">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">API Status</p>
              <h3 className="text-xl font-bold text-green-500 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                Healthy
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Users</p>
              <h3 className="text-2xl font-bold text-foreground">14,230</h3>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent rounded-xl text-accent-foreground">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Jobs Processed</p>
              <h3 className="text-2xl font-bold text-foreground">42k</h3>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending KYC</p>
              <h3 className="text-2xl font-bold text-foreground">84</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending KYC Approvals */}
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col h-[400px]">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">KYC Queue</h2>
            <span className="bg-yellow-500/10 text-yellow-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              84 Pending
            </span>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-xs sticky top-0">
                <tr>
                  <th className="px-6 py-3 font-medium">User</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Submitted</th>
                  <th className="px-6 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-3 font-medium text-foreground">user{i}@example.com</td>
                    <td className="px-6 py-3 text-muted-foreground">{i % 2 === 0 ? 'Worker' : 'Employer'}</td>
                    <td className="px-6 py-3 text-muted-foreground">2 hrs ago</td>
                    <td className="px-6 py-3 text-right">
                      <button onClick={() => alert(`Reviewing KYC for user${i}@example.com... (Simulated Action)`)} className="text-primary hover:underline font-medium">Review</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Alerts */}
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col h-[400px]">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">System Alerts</h2>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-3">
            <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-destructive text-sm">High Latency Detected</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Database query latency on the Jobs cluster has exceeded 500ms for the last 5 minutes.
                </p>
                <span className="text-[10px] text-muted-foreground mt-2 block">10 mins ago</span>
              </div>
            </div>
            
            <div className="p-4 border border-yellow-500/20 bg-yellow-500/5 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-600 text-sm">Redis Memory Warning</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Redis cache cluster memory usage is at 85%. Consider scaling up.
                </p>
                <span className="text-[10px] text-muted-foreground mt-2 block">1 hr ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
