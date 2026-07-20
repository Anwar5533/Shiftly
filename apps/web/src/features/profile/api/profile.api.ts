import api from '@/shared/lib/api';
import type { ApiResponse, WorkerProfile } from '@shiftly/shared-types';

export const profileApi = {
  getProfile: async (): Promise<WorkerProfile> => {
    const res = await api.get<ApiResponse<WorkerProfile>>('/workers/profile');
    return res.data.data;
  },

  updateProfile: async (data: any): Promise<WorkerProfile> => {
    const res = await api.patch<ApiResponse<WorkerProfile>>('/workers/profile', data);
    return res.data.data;
  },

  addSkill: async (data: { skillName: string; category: string; yearsExp: number; proficiency: string }) => {
    const res = await api.post<ApiResponse<any>>('/workers/skills', data);
    return res.data.data;
  },

  removeSkill: async (skillId: string) => {
    const res = await api.delete<ApiResponse<any>>(`/workers/skills/${skillId}`);
    return res.data.data;
  },
};
