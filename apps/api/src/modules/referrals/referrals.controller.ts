import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

@Controller('referrals')
@UseGuards(JwtAuthGuard)
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Get('code')
  async getCode(@Request() req: any) {
    return this.referralsService.getReferralCode(req.user.userId);
  }

  @Get('stats')
  async getStats(@Request() req: any) {
    return this.referralsService.getReferralStats(req.user.userId);
  }
}
