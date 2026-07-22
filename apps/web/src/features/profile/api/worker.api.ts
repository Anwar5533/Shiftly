/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-floating-promises, @typescript-eslint/no-misused-promises, @typescript-eslint/no-unsafe-argument, @typescript-eslint/require-await, @typescript-eslint/no-base-to-string, @typescript-eslint/prefer-promise-reject-errors, no-useless-assignment -- TODO(RC3): Fix linting issues */
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
    return response.data.data;
  },

  removeSkill: async (skillId: string) => {
    const response = await api.delete<ApiResponse<any>>(`/workers/skills/${skillId}`);
    return response.data.data;
  },

  getDashboardStats: async (): Promise<WorkerDashboardStats> => {
    const response = await api.get<ApiResponse<WorkerDashboardStats>>('/workers/dashboard');
    return response.data.data;
  },
};
