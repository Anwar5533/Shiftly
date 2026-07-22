/* eslint-disable @typescript-eslint/no-explicit-any -- TODO(RC3): Address type safety */
import api from '@/shared/lib/api';
import type { WorkerProfile, ApiResponse } from '@shiftly/shared-types';

export interface WorkerDashboardStats {
  totalEarnings: number;
  activeApplications: number;
  completedShifts: number;
  profileCompletion: number;
  rating: number;
}

export const workerApi = {
  getProfile: async (): Promise<WorkerProfile> => {
    const response = await api.get<ApiResponse<WorkerProfile>>('/workers/profile');
    return response.data.data;
  },

  updateProfile: async (data: Partial<WorkerProfile>): Promise<WorkerProfile> => {
    const response = await api.patch<ApiResponse<WorkerProfile>>('/workers/profile', data);
    return response.data.data;
  },

  addSkill: async (skillData: {
    skillName: string;
    category: string;
    yearsExp: number;
    proficiency: string;
  }) => {
    const response = await api.post<ApiResponse<any>>('/workers/skills', skillData);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- TODO(RC3): Address type safety
    return response.data.data;
  },

  removeSkill: async (skillId: string) => {
    const response = await api.delete<ApiResponse<any>>(`/workers/skills/${skillId}`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- TODO(RC3): Address type safety
    return response.data.data;
  },

  getDashboardStats: async (): Promise<WorkerDashboardStats> => {
    const response = await api.get<ApiResponse<WorkerDashboardStats>>('/workers/dashboard');
    return response.data.data;
  },
};
