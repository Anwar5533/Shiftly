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
    notifications.filter(n => !n.isRead).forEach(n => {
      markAsReadMutation.mutate(n.id);
    });
  };

  const removeNotification = (id: string) => {
    // Single delete not in API yet, fallback
    console.log(`Removing notification ${id}`);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
      default: return <Bell className="w-5 h-5 text-muted-foreground" />;
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
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
            Notifications
            {unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground text-sm py-1 px-3 rounded-full font-medium">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">Stay updated on your shifts, payments, and account alerts.</p>
        </div>
        
        {unreadCount > 0 && (
          <div className="flex gap-2">
            <button 
              onClick={clearAll}
              className="px-4 py-2 text-destructive font-medium rounded-lg hover:bg-destructive/10 transition-colors text-sm"
            >
              Clear all
            </button>
            <button 
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground font-medium rounded-lg hover:bg-muted/80 transition-colors shadow-sm text-sm"
            >
              <Check className="w-4 h-4" />
              Mark all as read
            </button>
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-lg font-medium text-foreground">You're all caught up!</h3>
            <p className="text-muted-foreground mt-1">No new notifications right now.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-5 flex gap-4 transition-colors hover:bg-muted/30 relative group ${!notification.isRead ? 'bg-primary/5' : ''}`}
              >
                {!notification.isRead && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                )}
                
                <div className="shrink-0 mt-1 bg-background border border-border p-2 rounded-full shadow-sm">
                  {getIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4">
                    <h4 className={`text-base font-semibold ${!notification.isRead ? 'text-foreground' : 'text-foreground/80'}`}>
                      {notification.title}
                    </h4>
                    <span className="text-xs font-medium text-muted-foreground shrink-0 flex items-center gap-1 bg-muted px-2 py-1 rounded-md">
                      <Clock className="w-3 h-3" />
                      {getTimeAgo(notification.createdAt)}
                    </span>
                  </div>
                  <p className={`mt-1 text-sm ${!notification.isRead ? 'text-foreground/90' : 'text-muted-foreground'}`}>
                    {notification.body}
                  </p>
                </div>

                <button 
                  onClick={() => removeNotification(notification.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md h-fit"
                  title="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
