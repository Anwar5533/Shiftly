import api from '../../../shared/lib/api';
import type { Conversation, Message, ApiResponse } from '@shiftly/shared-types';

export const messagingApi = {
  getConversations: async (): Promise<Conversation[]> => {
    const { data } = await api.get<ApiResponse<Conversation[]>>('/messaging/conversations');
    return data.data;
  },

  getMessages: async (conversationId: string): Promise<Message[]> => {
    const { data } = await api.get<ApiResponse<Message[]>>(`/messaging/conversations/${conversationId}/messages`);
    return data.data;
  },
};
