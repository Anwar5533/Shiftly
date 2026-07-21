import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';

@Controller('search')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('jobs')
  @Roles('WORKER', 'ADMIN')
  async searchJobs(
    @Query('q') query: string,
    @Query('category') category?: string,
    @Query('minPayRate') minPayRate?: string
  ) {
    return this.searchService.searchJobs(query, { category, minPayRate });
  }
}
