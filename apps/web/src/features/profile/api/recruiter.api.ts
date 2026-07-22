import api from '@/shared/lib/api';
import type { ApiResponse } from '@shiftly/shared-types';

export interface RecruiterProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  agencyName?: string;
  bio?: string;
  avatarUrl?: string;
  specialisations: string[];
  placements: number;
  successRate: number;
  rating: number;
  totalReviews: number;
  isVerified: boolean;
}

export interface UpdateRecruiterProfileData {
  firstName?: string;
  lastName?: string;
  agencyName?: string;
  bio?: string;
  avatarUrl?: string;
  specialisations?: string[];
}

export const recruiterApi = {
  getProfile: async (): Promise<RecruiterProfile> => {
    const { data } = await api.get<ApiResponse<RecruiterProfile>>('/recruiters/profile');
    return data.data;
  },

  updateProfile: async (profileData: UpdateRecruiterProfileData): Promise<RecruiterProfile> => {
    const { data } = await api.patch<ApiResponse<RecruiterProfile>>(
      '/recruiters/profile',
      profileData,
    );
    return data.data;
  },

  getDashboardStats: async () => {
    const { data } = await api.get<ApiResponse<Record<string, unknown>>>('/recruiters/dashboard');
    return data.data;
  },
};
