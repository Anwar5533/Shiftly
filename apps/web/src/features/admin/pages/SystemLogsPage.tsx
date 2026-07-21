import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShieldAlert, Info, AlertTriangle, Terminal, Filter, RefreshCw } from 'lucide-react';
import { auditApi } from '../api/audit.api';

export default function SystemLogsPage(): React.ReactElement {
  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ['system-logs'],
    queryFn: auditApi.getLogs
  });

  const getLevelStyle = (level: string) => {
    switch (level) {
      case 'CRITICAL': return { icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' };
      case 'ERROR': return { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-500/10 border-orange-500/20' };
      case 'WARNING': return { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' };
      default: return { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Terminal className="w-6 h-6 text-muted-foreground" /> System Logs
          </h1>
          <p className="text-muted-foreground mt-1">Real-time infrastructure and application events.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-muted text-foreground px-4 py-2 rounded-lg font-medium hover:bg-muted/80 flex items-center justify-center gap-2 transition-colors">
            <Filter className="w-4 h-4" /> Filter Logs
          </button>
          <button 
            onClick={() => refetch()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 flex items-center justify-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Logs
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden font-mono text-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 text-muted-foreground border-b border-border">
                <th className="p-4 font-medium">Timestamp</th>
                <th className="p-4 font-medium">Level</th>
                <th className="p-4 font-medium">Service</th>
                <th className="p-4 font-medium">Message</th>
                <th className="p-4 font-medium">Source IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">Loading logs...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No logs found.</td></tr>
              ) : logs.map((log: any) => {
                const style = getLevelStyle(log.severity);
                const Icon = style.icon;
                return (
                  <tr key={log.id} className="hover:bg-muted/10 transition-colors">
                    <td className="p-4 text-muted-foreground whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border ${style.bg} ${style.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                        <span className="font-semibold text-xs tracking-wider">{log.severity}</span>
                      </div>
                    </td>
                    <td className="p-4 text-primary/80 font-medium">{log.actorEmail || 'System'}</td>
                    <td className="p-4 text-foreground">{log.action} - {log.target}</td>
                    <td className="p-4 text-muted-foreground">{log.ip || 'Internal'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
