import api from '../../../shared/lib/api';

export const notificationsApi = {
  getNotifications: async () => {
    const response = await api.get('/notifications');
// eslint-disable-next-line @typescript-eslint/no-unsafe-return -- TODO(RC3): Address type safety
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.patch(`/notifications/${id}/read`);
// eslint-disable-next-line @typescript-eslint/no-unsafe-return -- TODO(RC3): Address type safety
    return response.data;
  },

  clearAll: async () => {
    const response = await api.delete('/notifications');
// eslint-disable-next-line @typescript-eslint/no-unsafe-return -- TODO(RC3): Address type safety
    return response.data;
  },
};
