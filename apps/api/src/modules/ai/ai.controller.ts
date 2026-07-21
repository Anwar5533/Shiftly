import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';

@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('match/:jobId')
  @Roles('WORKER')
  async getMatchScore(@Request() req: any, @Param('jobId') jobId: string) {
    return this.aiService.calculateMatchScore(req.user.userId, jobId);
  }
}
