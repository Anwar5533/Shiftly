import api from '../../../shared/lib/api';
import type { Conversation, Message } from '@shiftly/shared-types';

export const messagingApi = {
  getConversations: async (): Promise<Conversation[]> => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
    const { data } = await api.get('/messaging/conversations');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- TODO(RC3): Address type safety
    return data;
  },

  getMessages: async (conversationId: string): Promise<Message[]> => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
    const { data } = await api.get(`/messaging/conversations/${conversationId}/messages`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- TODO(RC3): Address type safety
    return data;
  },
};
