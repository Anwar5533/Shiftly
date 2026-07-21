import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShieldAlert, Info, AlertTriangle, Terminal, Filter, RefreshCw } from 'lucide-react';
import { auditApi } from '../api/audit.api';

export default function SystemLogsPage(): React.ReactElement {
  const {
    data: logs = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['system-logs'],
    queryFn: auditApi.getLogs,
  });

  const getLevelStyle = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return { icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' };
      case 'ERROR':
        return {
          icon: AlertTriangle,
          color: 'text-orange-500',
          bg: 'bg-orange-500/10 border-orange-500/20',
        };
      case 'WARNING':
        return {
          icon: AlertTriangle,
          color: 'text-amber-500',
          bg: 'bg-amber-500/10 border-amber-500/20',
        };
      default:
        return { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            <Terminal className="h-6 w-6 text-muted-foreground" /> System Logs
          </h1>
          <p className="mt-1 text-muted-foreground">
            Real-time infrastructure and application events.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center justify-center gap-2 rounded-lg bg-muted px-4 py-2 font-medium text-foreground transition-colors hover:bg-muted/80">
            <Filter className="h-4 w-4" /> Filter Logs
          </button>
          <button
            onClick={() => refetch()}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <RefreshCw className="h-4 w-4" /> Refresh Logs
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card font-mono text-sm shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-muted-foreground">
                <th className="p-4 font-medium">Timestamp</th>
                <th className="p-4 font-medium">Level</th>
                <th className="p-4 font-medium">Service</th>
                <th className="p-4 font-medium">Message</th>
                <th className="p-4 font-medium">Source IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-muted-foreground">
                    Loading logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-muted-foreground">
                    No logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log: any) => {
                  const style = getLevelStyle(log.severity);
                  const Icon = style.icon;
                  return (
                    <tr key={log.id} className="transition-colors hover:bg-muted/10">
                      <td className="whitespace-nowrap p-4 text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <div
                          className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 ${style.bg} ${style.color}`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          <span className="text-xs font-semibold tracking-wider">
                            {log.severity}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 font-medium text-primary/80">
                        {log.actorEmail || 'System'}
                      </td>
                      <td className="p-4 text-foreground">
                        {log.action} - {log.target}
                      </td>
                      <td className="p-4 text-muted-foreground">{log.ip || 'Internal'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
