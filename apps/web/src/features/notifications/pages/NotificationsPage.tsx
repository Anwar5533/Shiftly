/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-floating-promises, @typescript-eslint/no-misused-promises, @typescript-eslint/no-unsafe-argument, @typescript-eslint/require-await, @typescript-eslint/no-base-to-string, @typescript-eslint/prefer-promise-reject-errors, no-useless-assignment -- TODO(RC3): Fix linting issues */
import React from 'react';
import { Bell, Check, Clock, Info, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../api/notifications.api';

type NotificationType = 'system' | 'success' | 'warning' | 'info';

interface Notification {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  type: NotificationType;
  createdAt: string;
}

export default function NotificationsPage(): React.ReactElement {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: notificationsApi.getNotifications,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: () => notificationsApi.clearAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const clearAll = () => {
    clearAllMutation.mutate();
  };

  const markAllAsRead = () => {
    notifications
      .filter((n) => !n.isRead)
      .forEach((n) => {
        markAsReadMutation.mutate(n.id);
      });
  };

  const removeNotification = (id: string) => {
    // Single delete not in API yet, fallback
    console.log(`Removing notification ${id}`);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getTimeAgo = (dateString: string) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-foreground">
            Notifications
            {unreadCount > 0 && (
              <span className="rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Stay updated on your shifts, payments, and account alerts.
          </p>
        </div>

        {unreadCount > 0 && (
          <div className="flex gap-2">
            <button
              onClick={clearAll}
              className="rounded-lg px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              Clear all
            </button>
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted/80"
            >
              <Check className="h-4 w-4" />
              Mark all as read
            </button>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center p-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Bell className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-lg font-medium text-foreground">You're all caught up!</h3>
            <p className="mt-1 text-muted-foreground">No new notifications right now.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`group relative flex gap-4 p-5 transition-colors hover:bg-muted/30 ${!notification.isRead ? 'bg-primary/5' : ''}`}
              >
                {!notification.isRead && (
                  <div className="absolute bottom-0 left-0 top-0 w-1 bg-primary"></div>
                )}

                <div className="mt-1 shrink-0 rounded-full border border-border bg-background p-2 shadow-sm">
                  {getIcon(notification.type)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <h4
                      className={`text-base font-semibold ${!notification.isRead ? 'text-foreground' : 'text-foreground/80'}`}
                    >
                      {notification.title}
                    </h4>
                    <span className="flex shrink-0 items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {getTimeAgo(notification.createdAt)}
                    </span>
                  </div>
                  <p
                    className={`mt-1 text-sm ${!notification.isRead ? 'text-foreground/90' : 'text-muted-foreground'}`}
                  >
                    {notification.body}
                  </p>
                </div>

                <button
                  onClick={() => removeNotification(notification.id)}
                  className="h-fit rounded-md p-2 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  title="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
