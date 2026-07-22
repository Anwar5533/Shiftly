import api from '../../../shared/lib/api';
import type { ApiResponse } from '@shiftly/shared-types';

export const notificationsApi = {
  getNotifications: async () => {
    const response = await api.get<ApiResponse<Record<string, unknown>>>('/notifications');
    return response.data.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.patch<ApiResponse<Record<string, unknown>>>(
      `/notifications/${id}/read`,
    );
    return response.data.data;
  },

  clearAll: async () => {
    const response = await api.delete<ApiResponse<Record<string, unknown>>>('/notifications');
    return response.data.data;
  },
};
