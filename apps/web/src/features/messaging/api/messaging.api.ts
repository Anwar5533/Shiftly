/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-floating-promises, @typescript-eslint/no-misused-promises, @typescript-eslint/no-unsafe-argument, @typescript-eslint/require-await, @typescript-eslint/no-base-to-string, @typescript-eslint/prefer-promise-reject-errors, no-useless-assignment -- TODO(RC3): Fix linting issues */
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
