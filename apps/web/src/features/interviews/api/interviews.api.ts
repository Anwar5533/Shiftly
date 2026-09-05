import api from '../../../shared/lib/api';
import type { ApiResponse } from '@shiftly/shared-types';

export interface Interview {
  id: number;
  candidate: string;
  role: string;
  time: string;
  date: string;
  type: string;
  interviewer: string;
  status: string;
}

export const interviewsApi = {
  getInterviews: async (): Promise<Interview[]> => {
    const { data } = await api.get<ApiResponse<Interview[]>>('/interviews');
    return data.data;
  },
};
