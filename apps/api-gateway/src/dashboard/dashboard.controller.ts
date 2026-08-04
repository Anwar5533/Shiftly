import { Controller, Get, Logger, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  private readonly logger = new Logger(DashboardController.name);

  constructor(private readonly dashboardService: DashboardService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('worker/me')
  async getWorkerDashboard(@Req() req: any) {
    const userId = req.user.userId;
    this.logger.log(`Received request for worker dashboard: ${userId}`);
    return this.dashboardService.getWorkerDashboard(userId);
  }
}
