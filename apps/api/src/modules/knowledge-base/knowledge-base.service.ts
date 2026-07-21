import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class KnowledgeBaseService {
  constructor(private prisma: PrismaService) {}

  async getCategories() {
    return this.prisma.kbCategory.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getArticlesByCategory(categoryId: string) {
    return this.prisma.kbArticle.findMany({
      where: { categoryId, isPublished: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        viewCount: true,
      },
    });
  }

  async getArticleBySlug(slug: string) {
    const article = await this.prisma.kbArticle.findUnique({
      where: { slug },
      include: { category: true },
    });
    
    if (article) {
      // Increment view count in background
      this.prisma.kbArticle.update({
        where: { id: article.id },
        data: { viewCount: { increment: 1 } },
      }).catch(console.error);
    }
    
    return article;
  }
}
