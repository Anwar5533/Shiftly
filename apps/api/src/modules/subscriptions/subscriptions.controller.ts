/* eslint-disable prettier/prettier -- TODO(RC3): Address type safety */
import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { SubscriptionPlan } from '@prisma/client';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('current')
  @Roles('EMPLOYER', 'RECRUITER')
  async getCurrentSubscription(@Request() req: any) {
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
    return this.subscriptionsService.getCurrentSubscription(req.user.userId);
  }

  @Get('invoices')
  @Roles('EMPLOYER', 'RECRUITER')
  async getInvoices(@Request() req: any) {
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
    return this.subscriptionsService.getInvoices(req.user.userId);
  }

  @Post('upgrade')
  @Roles('EMPLOYER', 'RECRUITER')
  async upgradePlan(@Request() req: any, @Body('plan') plan: SubscriptionPlan) {
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
    return this.subscriptionsService.upgradePlan(req.user.userId, plan);
  }
}
