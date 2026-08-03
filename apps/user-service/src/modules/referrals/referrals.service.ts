/* eslint-disable @typescript-eslint/no-unused-vars -- TODO(RC3): Address type safety */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class ReferralsService {
  constructor(private prisma: PrismaService) {}

  async getReferralCode(userId: string) {
    const code = await this.prisma.referralCode.findUnique({
      where: { userId },
    });

    if (!code) {
      // Generate a mock one for now if doesn't exist
      // Real logic would be creating a string based on user's name or UUID prefix
      const newCodeStr = `REF-${userId.substring(0, 6).toUpperCase()}`;
      return this.prisma.referralCode.create({
        data: {
          userId,
          code: newCodeStr,
        },
      });
    }
    return code;
  }

  // eslint-disable-next-line @typescript-eslint/require-await -- TODO(RC3): Address type safety
  async getReferralStats(userId: string) {
    // Return mock stats
    return {
      totalReferrals: 12,
      activeReferrals: 5,
      totalEarned: 150.0,
      currency: 'USD',
    };
  }
}
