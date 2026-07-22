import api from '../../../shared/lib/api';

export const reviewsApi = {
  createReview: async (data: {
    jobId: string;
    revieweeId: string;
    targetType: string;
    rating: number;
    comment?: string;
  }) => {
    const response = await api.post('/reviews', data);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- TODO(RC3): Address type safety
    return response.data;
  },

  getUserReviews: async (userId: string) => {
    const response = await api.get(`/reviews/user/${userId}`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- TODO(RC3): Address type safety
    return response.data;
  },
};
