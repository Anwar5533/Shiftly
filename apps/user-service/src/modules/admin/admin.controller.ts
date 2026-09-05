import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller({ path: 'admin', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get platform analytics for admin dashboard' })
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Post('kyc/:userId/approve')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Approve KYC for user' })
  approveKyc(@Param('userId') userId: string) {
    return this.adminService.approveKyc(userId);
  }
}
