import api from '../../../shared/lib/api';

export const reviewsApi = {
  createReview: async (data: { jobId: string; revieweeId: string; targetType: string; rating: number; comment?: string }) => {
    const response = await api.post('/reviews', data);
    return response.data;
  },

  getUserReviews: async (userId: string) => {
    const response = await api.get(`/reviews/user/${userId}`);
    return response.data;
  }
};
