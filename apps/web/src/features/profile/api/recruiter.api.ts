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
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
    const { data } = await api.get('/recruiters/profile');
// eslint-disable-next-line @typescript-eslint/no-unsafe-return -- TODO(RC3): Address type safety
    return data;
  },

  updateProfile: async (profileData: UpdateRecruiterProfileData): Promise<RecruiterProfile> => {
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
    const { data } = await api.patch('/recruiters/profile', profileData);
// eslint-disable-next-line @typescript-eslint/no-unsafe-return -- TODO(RC3): Address type safety
    return data;
  },

  getDashboardStats: async () => {
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
    const { data } = await api.get('/recruiters/dashboard');
// eslint-disable-next-line @typescript-eslint/no-unsafe-return -- TODO(RC3): Address type safety
    return data;
  },
};
