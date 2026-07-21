import api from '../../../shared/lib/api';
import type { AssistantMessage } from '@shiftly/shared-types';

export const chatApi = {
  sendMessage: async (prompt: string, history: AssistantMessage[] = []): Promise<AssistantMessage> => {
    const { data } = await api.post('/chat/message', { prompt, history });
    return data;
  }
};
