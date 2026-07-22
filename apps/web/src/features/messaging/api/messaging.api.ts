import api from '../../../shared/lib/api';
import type { Conversation, Message } from '@shiftly/shared-types';

export const messagingApi = {
  getConversations: async (): Promise<Conversation[]> => {
    const { data } = await api.get('/messaging/conversations');
    return data;
  },

  getMessages: async (conversationId: string): Promise<Message[]> => {
    const { data } = await api.get(`/messaging/conversations/${conversationId}/messages`);
    return data;
  },
};
