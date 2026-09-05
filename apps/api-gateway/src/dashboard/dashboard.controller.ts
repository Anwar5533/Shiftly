import {
  Controller,
  ForbiddenException,
  Get,
  Logger,
  Req,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { ADMIN_ROLES, AuthenticatedRequest } from '../shared/types/authenticated-request';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(CacheInterceptor)
@Controller('dashboard')
export class DashboardController {
  private readonly logger = new Logger(DashboardController.name);

  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * Extracts the raw Bearer token so it can be forwarded to downstream
   * microservices, which verify it with their own JwtAuthGuard. The request is
   * already authenticated by AuthGuard('jwt'), so a missing header here means
   * something rewrote the request and we fail closed.
   */
  private extractBearerToken(req: AuthenticatedRequest): string {
    const authHeader = req.headers.authorization ?? '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!token) {
      throw new UnauthorizedException('Missing Bearer token');
    }
    return token;
  }

  private extractTraceparent(req: AuthenticatedRequest): string | undefined {
    const traceparent = req.headers.traceparent;
    return Array.isArray(traceparent) ? traceparent[0] : traceparent;
  }

  @Get('worker/me')
  @ApiOperation({ summary: 'Aggregated worker dashboard for the calling user' })
  async getWorkerDashboard(@Req() req: AuthenticatedRequest) {
    const { userId } = req.user;
    this.logger.log(`Aggregating worker dashboard for ${userId}`);
    return this.dashboardService.getWorkerDashboard(
      userId,
      this.extractBearerToken(req),
      this.extractTraceparent(req),
    );
  }

  @Get('employer/me')
  @ApiOperation({ summary: 'Aggregated employer dashboard for the calling user' })
  async getEmployerDashboard(@Req() req: AuthenticatedRequest) {
    const { userId } = req.user;
    this.logger.log(`Aggregating employer dashboard for ${userId}`);
    return this.dashboardService.getEmployerDashboard(
      userId,
      this.extractBearerToken(req),
      this.extractTraceparent(req),
    );
  }

  @Get('admin/summary')
  @ApiOperation({ summary: 'Platform-wide admin aggregates (admin roles only)' })
  async getAdminDashboard(@Req() req: AuthenticatedRequest) {
    if (!ADMIN_ROLES.includes(req.user.role as (typeof ADMIN_ROLES)[number])) {
      throw new ForbiddenException('Only admins can access this dashboard');
    }
    this.logger.log(`Aggregating admin dashboard for ${req.user.userId}`);
    return this.dashboardService.getAdminDashboard(
      this.extractBearerToken(req),
      this.extractTraceparent(req),
    );
  }
}
