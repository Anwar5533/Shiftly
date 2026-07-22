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
