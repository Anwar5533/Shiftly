/* eslint-disable @typescript-eslint/no-unused-vars, prettier/prettier -- TODO(RC3): Address type safety */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async getCurrentSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      // Return a default free plan if none exists
      return {
        id: 'free_tier',
        userId,
        plan: SubscriptionPlan.FREE,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1),
        ),
        stripeSubscriptionId: null,
        stripeCustomerId: null,
      };
    }

    return subscription;
  }

  // eslint-disable-next-line @typescript-eslint/require-await -- TODO(RC3): Address type safety
  async getInvoices(userId: string) {
    // In a real app, this would fetch from Stripe or the DB
    // Returning mock data to fulfill frontend UI
    return [
      {
        id: 'INV-2026-042',
        date: 'Jul 01, 2026',
        amount: '$499.00',
        status: 'Paid',
        plan: 'Enterprise Monthly',
      },
      {
        id: 'INV-2026-038',
        date: 'Jun 01, 2026',
        amount: '$499.00',
        status: 'Paid',
        plan: 'Enterprise Monthly',
      },
      {
        id: 'INV-2026-031',
        date: 'May 01, 2026',
        amount: '$499.00',
        status: 'Paid',
        plan: 'Enterprise Monthly',
      },
    ];
  }

  async upgradePlan(userId: string, plan: SubscriptionPlan) {
    const subscription = await this.prisma.subscription.upsert({
      where: { userId },
      update: {
        plan,
        status: SubscriptionStatus.ACTIVE,
      },
      create: {
        userId,
        plan,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(
          new Date().setMonth(new Date().getMonth() + 1),
        ),
      },
    });

    return subscription;
  }
}
