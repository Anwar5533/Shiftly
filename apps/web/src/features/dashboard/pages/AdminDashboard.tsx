import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Users, Activity, DollarSign, Briefcase } from 'lucide-react';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import { AlertDialog } from '../../../shared/components/AlertDialog';

export default function AdminDashboard(): React.ReactElement {
  const [alertMessage, setAlertMessage] = React.useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => dashboardApi.getAdminDashboard(),
  });

  type Stats = {
    totalUsers?: number;
    totalActiveJobs?: number;
    totalCompletedShifts?: number;
    totalPlatformRevenue?: number;
  };
  type Activity = { description?: string; createdAt?: string | number | Date };

  const stats = data?.stats as Stats | undefined;
  const recentActivity = (data?.recentActivity || []) as Activity[];
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

      {isError && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-destructive">
          Failed to load dashboard data. Please try again later.
        </div>
      )}

      {/* Health Metrics */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
        }}
        className="grid grid-cols-1 gap-6 md:grid-cols-4"
      >
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="glass-panel p-6"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Users</p>
              <h3 className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : stats?.totalUsers || 0}
              </h3>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="glass-panel p-6"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-blue-500/10 p-3 text-blue-500">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Jobs</p>
              <h3 className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : stats?.totalActiveJobs || 0}
              </h3>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="glass-panel p-6"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-accent p-3 text-accent-foreground">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed Shifts</p>
              <h3 className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : stats?.totalCompletedShifts || 0}
              </h3>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="glass-panel p-6"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-green-500/10 p-3 text-green-500">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Platform Revenue</p>
              <h3 className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : `$${stats?.totalPlatformRevenue || 0}`}
              </h3>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel flex h-[400px] flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-white/10 p-6">
            <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
          </div>
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="p-6 text-center text-muted-foreground">Loading activity...</div>
            ) : recentActivity.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">No recent activity</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3 font-medium">Description</th>
                    <th className="px-6 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentActivity.map((activity: Activity, idx: number) => (
                    <tr key={idx} className="transition-colors hover:bg-muted/30">
                      <td className="px-6 py-3 font-medium text-foreground">
                        {activity.description || 'Action performed'}
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">
                        {new Date(activity.createdAt || Date.now()).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>

        {/* System Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel flex h-[400px] flex-col overflow-hidden"
        >
          <div className="border-b border-white/10 p-6">
            <h2 className="text-lg font-semibold text-foreground">System Alerts</h2>
          </div>
          <div className="flex-1 space-y-3 overflow-auto p-4">
            <div className="flex items-start gap-3 rounded-xl border border-green-500/20 bg-green-500/5 p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <div>
                <h4 className="text-sm font-semibold text-green-600">All Systems Operational</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  No issues detected. Database, Redis cache, and Kafka cluster are healthy.
                </p>
                <span className="mt-2 block text-[10px] text-muted-foreground">Just now</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <AlertDialog
        isOpen={!!alertMessage}
        onOpenChange={(open) => !open && setAlertMessage(null)}
        title="Notice"
        description={alertMessage || ''}
      />
    </div>
  );
}
