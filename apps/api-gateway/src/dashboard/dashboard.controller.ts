/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import { Controller, Get, Logger, UseGuards, Req, ForbiddenException } from '@nestjs/common';
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
  @UseGuards(AuthGuard('jwt'))
  @Get('employer/me')
  async getEmployerDashboard(@Req() req: any) {
    const userId = req.user.userId;
    this.logger.log(`Received request for employer dashboard: ${userId}`);
    return this.dashboardService.getEmployerDashboard(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('admin/summary')
  async getAdminDashboard(@Req() req: any) {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only admins can access this dashboard');
    }
    this.logger.log(`Received request for admin dashboard summary`);
    return this.dashboardService.getAdminDashboard();
  }
}
