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
