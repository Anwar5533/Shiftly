import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { KnowledgeBaseService } from './knowledge-base.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

@Controller('kb')
@UseGuards(JwtAuthGuard)
export class KnowledgeBaseController {
  constructor(private readonly kbService: KnowledgeBaseService) {}

  @Get('categories')
  async getCategories() {
    return this.kbService.getCategories();
  }

  @Get('categories/:id/articles')
  async getArticlesByCategory(@Param('id') categoryId: string) {
    return this.kbService.getArticlesByCategory(categoryId);
  }

  @Get('articles/:slug')
  async getArticle(@Param('slug') slug: string) {
    return this.kbService.getArticleBySlug(slug);
  }
}
