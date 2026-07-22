/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-floating-promises, @typescript-eslint/no-misused-promises, @typescript-eslint/no-unsafe-argument, @typescript-eslint/require-await, @typescript-eslint/no-base-to-string, @typescript-eslint/prefer-promise-reject-errors, no-useless-assignment -- TODO(RC3): Fix linting issues */
import api from '@/shared/lib/api';

export interface KbCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface KbArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  viewCount: number;
}

export const kbApi = {
  getCategories: async (): Promise<KbCategory[]> => {
    const { data } = await api.get('/kb/categories');
    return data;
  },

  getArticlesByCategory: async (categoryId: string): Promise<KbArticle[]> => {
    const { data } = await api.get(`/kb/categories/${categoryId}/articles`);
    return data;
  },
};
