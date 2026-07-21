import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createTransaction(data: {
    walletId: string;
    type:
      | 'TOPUP'
      | 'WITHDRAWAL'
      | 'ESCROW_LOCK'
      | 'ESCROW_RELEASE'
      | 'ESCROW_REFUND'
      | 'PLATFORM_FEE'
      | 'REFERRAL_BONUS';
    amount: number;
    currency?: string;
    status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED';
    description: string;
    tx?: any; // For prisma interactive transactions
  }) {
    const db = data.tx || this.prisma;
    return db.transaction.create({
      data: {
        walletId: data.walletId,
        type: data.type,
        amount: data.amount,
        currency: data.currency || 'INR',
        status: data.status || 'COMPLETED',
        description: data.description,
      },
    });
  }

  async getTransactions(walletId: string) {
    return this.prisma.transaction.findMany({
      where: { walletId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
