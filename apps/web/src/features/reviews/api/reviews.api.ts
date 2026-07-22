/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-floating-promises, @typescript-eslint/no-misused-promises, @typescript-eslint/no-unsafe-argument, @typescript-eslint/require-await, @typescript-eslint/no-base-to-string, @typescript-eslint/prefer-promise-reject-errors, no-useless-assignment -- TODO(RC3): Fix linting issues */
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
    return response.data;
  },

  getUserReviews: async (userId: string) => {
    const response = await api.get(`/reviews/user/${userId}`);
    return response.data;
  },
};
