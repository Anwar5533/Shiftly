import React, { useState } from 'react';
import { Bell, Check, Clock, Info, CheckCircle2, AlertTriangle, X } from 'lucide-react';

type NotificationType = 'system' | 'success' | 'warning' | 'info';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: NotificationType;
}

export default function NotificationsPage(): React.ReactElement {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Shift Confirmed',
      message: 'Your shift for Warehouse Associate at Amazon Fulfillment Center has been confirmed.',
      time: '10 mins ago',
      read: false,
      type: 'success'
    },
    {
      id: '2',
      title: 'Profile Incomplete',
      message: 'Please complete your profile by adding a government ID to unlock higher paying shifts.',
      time: '2 hours ago',
      read: false,
      type: 'warning'
    },
    {
      id: '3',
      title: 'Payment Processed',
      message: 'Your payment of ₹10,000.00 for the shift on Oct 18 has been processed and sent to your bank.',
      time: 'Yesterday',
      read: true,
      type: 'info'
    },
    {
      id: '4',
      title: 'Welcome to Shiftly',
      message: 'We are glad to have you! Check out the Jobs board to find your first shift.',
      time: '2 days ago',
      read: true,
      type: 'system'
    }
  ]);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
      default: return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
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
          <button 
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground font-medium rounded-lg hover:bg-muted/80 transition-colors shadow-sm text-sm"
          >
            <Check className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {notifications.length === 0 ? (
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
                className={`p-5 flex gap-4 transition-colors hover:bg-muted/30 relative group ${!notification.read ? 'bg-primary/5' : ''}`}
              >
                {!notification.read && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                )}
                
                <div className="shrink-0 mt-1 bg-background border border-border p-2 rounded-full shadow-sm">
                  {getIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4">
                    <h4 className={`text-base font-semibold ${!notification.read ? 'text-foreground' : 'text-foreground/80'}`}>
                      {notification.title}
                    </h4>
                    <span className="text-xs font-medium text-muted-foreground shrink-0 flex items-center gap-1 bg-muted px-2 py-1 rounded-md">
                      <Clock className="w-3 h-3" />
                      {notification.time}
                    </span>
                  </div>
                  <p className={`mt-1 text-sm ${!notification.read ? 'text-foreground/90' : 'text-muted-foreground'}`}>
                    {notification.message}
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
