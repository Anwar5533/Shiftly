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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
    const { data } = await api.get('/kb/categories');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- TODO(RC3): Address type safety
    return data;
  },

  getArticlesByCategory: async (categoryId: string): Promise<KbArticle[]> => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
    const { data } = await api.get(`/kb/categories/${categoryId}/articles`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- TODO(RC3): Address type safety
    return data;
  },
};
