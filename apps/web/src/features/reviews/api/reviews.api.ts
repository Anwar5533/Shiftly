import api from '../../../shared/lib/api';
import type { ApiResponse } from '@shiftly/shared-types';

export const reviewsApi = {
  createReview: async (data: {
    jobId: string;
    revieweeId: string;
    targetType: string;
    rating: number;
    comment?: string;
  }) => {
    const response = await api.post<ApiResponse<Record<string, unknown>>>('/reviews', data);
    return response.data;
  },

  getUserReviews: async (userId: string) => {
    const response = await api.get<ApiResponse<Record<string, unknown>>>(`/reviews/user/${userId}`);
    return response.data;
  },
};
