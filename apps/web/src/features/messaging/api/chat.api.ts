import api from '../../../shared/lib/api';
import type { AssistantMessage } from '@shiftly/shared-types';

export const chatApi = {
  sendMessage: async (
    prompt: string,
    history: AssistantMessage[] = [],
  ): Promise<AssistantMessage> => {
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
    const { data } = await api.post('/chat/message', { prompt, history });
// eslint-disable-next-line @typescript-eslint/no-unsafe-return -- TODO(RC3): Address type safety
    return data;
  },
};
