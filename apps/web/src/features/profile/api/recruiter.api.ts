/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-floating-promises, @typescript-eslint/no-misused-promises, @typescript-eslint/no-unsafe-argument, @typescript-eslint/require-await, @typescript-eslint/no-base-to-string, @typescript-eslint/prefer-promise-reject-errors, no-useless-assignment -- TODO(RC3): Fix linting issues */
import api from '@/shared/lib/api';

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
    const { data } = await api.get('/recruiters/profile');
    return data;
  },

  updateProfile: async (profileData: UpdateRecruiterProfileData): Promise<RecruiterProfile> => {
    const { data } = await api.patch('/recruiters/profile', profileData);
    return data;
  },

  getDashboardStats: async () => {
    const { data } = await api.get('/recruiters/dashboard');
    return data;
  },
};
