/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-floating-promises, @typescript-eslint/no-misused-promises, @typescript-eslint/no-unsafe-argument, @typescript-eslint/require-await, @typescript-eslint/no-base-to-string, @typescript-eslint/prefer-promise-reject-errors, no-useless-assignment -- TODO(RC3): Fix linting issues */
import api from '../../../shared/lib/api';
import type { AssistantMessage } from '@shiftly/shared-types';

export const chatApi = {
  sendMessage: async (
    prompt: string,
    history: AssistantMessage[] = [],
  ): Promise<AssistantMessage> => {
    const { data } = await api.post('/chat/message', { prompt, history });
    return data;
  },
};
