import api from '../../../shared/lib/api';

export const notificationsApi = {
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  clearAll: async () => {
    const response = await api.delete('/notifications');
    return response.data;
  }
};
