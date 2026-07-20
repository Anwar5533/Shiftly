import React from 'react';
import { ShieldAlert, Info, AlertTriangle, Terminal, Filter, RefreshCw } from 'lucide-react';

export default function SystemLogsPage(): React.ReactElement {
  const logs = [
    {
      id: 'LOG-9921',
      timestamp: '2026-07-20 10:14:22',
      level: 'ERROR',
      service: 'auth-service',
      message: 'Failed login attempt - Invalid credentials',
      ip: '192.168.1.45'
    },
    {
      id: 'LOG-9920',
      timestamp: '2026-07-20 10:12:05',
      level: 'INFO',
      service: 'billing-api',
      message: 'Successfully processed invoice INV-2026-042',
      ip: 'Internal'
    },
    {
      id: 'LOG-9919',
      timestamp: '2026-07-20 10:05:11',
      level: 'WARNING',
      service: 'notification-worker',
      message: 'High latency detected in email delivery queue (>2000ms)',
      ip: 'Internal'
    },
    {
      id: 'LOG-9918',
      timestamp: '2026-07-20 09:55:00',
      level: 'CRITICAL',
      service: 'payment-gateway',
      message: 'Connection timeout to Stripe API. Retrying...',
      ip: 'Internal'
    },
    {
      id: 'LOG-9917',
      timestamp: '2026-07-20 09:42:18',
      level: 'INFO',
      service: 'user-service',
      message: 'New employer account registered: TechCorp Inc.',
      ip: '203.0.113.88'
    }
  ];

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
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 flex items-center justify-center gap-2 transition-colors">
            <RefreshCw className="w-4 h-4" /> Live Tail
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
              {logs.map((log) => {
                const style = getLevelStyle(log.level);
                const Icon = style.icon;
                return (
                  <tr key={log.id} className="hover:bg-muted/10 transition-colors">
                    <td className="p-4 text-muted-foreground whitespace-nowrap">{log.timestamp}</td>
                    <td className="p-4">
                      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border ${style.bg} ${style.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                        <span className="font-semibold text-xs tracking-wider">{log.level}</span>
                      </div>
                    </td>
                    <td className="p-4 text-primary/80 font-medium">{log.service}</td>
                    <td className="p-4 text-foreground">{log.message}</td>
                    <td className="p-4 text-muted-foreground">{log.ip}</td>
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
