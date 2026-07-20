import { describe, it, expect, vi } from 'vitest';
import notificationsReducer, {
  setNotifications,
  addNotification,
  markAsRead,
  markAllAsRead,
} from './notificationsSlice';
import type { Notification } from '@shiftly/shared-types';

describe('notificationsSlice', () => {
  const initialState = {
    items: [],
    unreadCount: 0,
  };

  const mockNotification1: Notification = {
    id: '1',
    userId: 'u1',
    type: 'SYSTEM',
    title: 'Test 1',
    message: 'Message 1',
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  const mockNotification2: Notification = {
    id: '2',
    userId: 'u1',
    type: 'SYSTEM',
    title: 'Test 2',
    message: 'Message 2',
    isRead: true,
    createdAt: new Date().toISOString(),
  };

  it('should return the initial state', () => {
    expect(notificationsReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setNotifications', () => {
    const actual = notificationsReducer(initialState, setNotifications([mockNotification1, mockNotification2]));
    expect(actual.items.length).toBe(2);
    expect(actual.unreadCount).toBe(1);
  });

  it('should handle addNotification with unread notification', () => {
    const actual = notificationsReducer(initialState, addNotification(mockNotification1));
    expect(actual.items[0]).toEqual(mockNotification1);
    expect(actual.unreadCount).toBe(1);
  });

  it('should handle addNotification with read notification', () => {
    const actual = notificationsReducer(initialState, addNotification(mockNotification2));
    expect(actual.items[0]).toEqual(mockNotification2);
    expect(actual.unreadCount).toBe(0);
  });

  it('should handle markAsRead', () => {
    const stateWithNotifications = notificationsReducer(initialState, setNotifications([mockNotification1]));
    
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-20T12:00:00Z'));
    
    const actual = notificationsReducer(stateWithNotifications, markAsRead('1'));
    expect(actual.items[0].isRead).toBe(true);
    expect(actual.items[0].readAt).toBe('2026-07-20T12:00:00.000Z');
    expect(actual.unreadCount).toBe(0);
    
    vi.useRealTimers();
  });

  it('should handle markAsRead for non-existent notification', () => {
    const stateWithNotifications = notificationsReducer(initialState, setNotifications([mockNotification1]));
    const actual = notificationsReducer(stateWithNotifications, markAsRead('invalid-id'));
    expect(actual).toEqual(stateWithNotifications);
  });

  it('should handle markAllAsRead', () => {
    const stateWithNotifications = notificationsReducer(
      initialState,
      setNotifications([mockNotification1, { ...mockNotification2, isRead: false, id: '3' }])
    );
    
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-20T12:00:00Z'));
    
    const actual = notificationsReducer(stateWithNotifications, markAllAsRead());
    expect(actual.items.every((n) => n.isRead === true)).toBe(true);
    expect(actual.items.every((n) => n.readAt === '2026-07-20T12:00:00.000Z')).toBe(true);
    expect(actual.unreadCount).toBe(0);
    
    vi.useRealTimers();
  });
});
