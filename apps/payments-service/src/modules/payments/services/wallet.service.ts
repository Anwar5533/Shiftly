import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { TopupWalletDto } from '../dto/topup-wallet.dto';
import { WithdrawFundsDto } from '../dto/withdraw-funds.dto';
import { TransactionType, TransactionStatus, Prisma } from '@prisma/client-payments-service';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async getBalance(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      // Create wallet if it doesn't exist
      return this.prisma.wallet.create({
        data: {
          userId,
          balance: 0,
          currency: 'INR',
        },
      });
    }

    return wallet;
  }

  async getTransactions(userId: string) {
    return this.prisma.transaction.findMany({
      where: {
        wallet: { userId },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async topup(userId: string, topupDto: TopupWalletDto) {
    if (topupDto.amount <= 0) {
      throw new BadRequestException('Top up amount must be greater than 0');
    }

    const wallet = await this.getBalance(userId);
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Create PENDING transaction for payment gateway session.
    // Wallet balance is NOT incremented until verified payment is captured/webhook received.
    const transaction = await this.prisma.transaction.create({
      data: {
        walletId: wallet.id,
        amount: topupDto.amount,
        type: TransactionType.TOPUP,
        status: TransactionStatus.PENDING,
        referenceId: orderId,
        description: `Wallet top up of ${topupDto.amount} ${topupDto.currency || 'INR'}`,
        currency: topupDto.currency || 'INR',
      },
    });

    return {
      ...transaction,
      orderId,
    };
  }

  async fulfillTopup(
    orderIdOrRef: string,
    externalTxnId: string,
    metadata?: Record<string, unknown>,
  ) {
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        OR: [{ referenceId: orderIdOrRef }, { id: orderIdOrRef }],
      },
    });

    if (!transaction) {
      return null;
    }

    // Idempotent fulfillment: already completed transactions must not be credited again
    if (transaction.status === TransactionStatus.COMPLETED) {
      return transaction;
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { id: transaction.walletId },
        data: {
          balance: {
            increment: transaction.amount,
          },
        },
      });

      const updatedTx = await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          status: TransactionStatus.COMPLETED,
          externalTxnId,
          metadata: metadata ? (metadata as Prisma.InputJsonValue) : undefined,
        },
      });

      return updatedTx;
    });
  }

  async withdraw(userId: string, withdrawDto: WithdrawFundsDto) {
    if (withdrawDto.amount <= 0) {
      throw new BadRequestException('Withdraw amount must be greater than 0');
    }

    return this.prisma.$transaction(async (tx) => {
      // Row-level lock to prevent concurrent overdraft race conditions
      const wallets = await tx.$queryRaw<
        Array<{ id: string; balance: Prisma.Decimal; userId: string }>
      >`
        SELECT id, balance, "userId"
        FROM payments.wallets
        WHERE "userId" = ${userId}::uuid
        FOR UPDATE
      `;

      const wallet = wallets[0];
      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      if (Number(wallet.balance) < withdrawDto.amount) {
        throw new BadRequestException('Insufficient balance');
      }

      const transaction = await tx.transaction.create({
        data: {
          walletId: wallet.id,
          amount: withdrawDto.amount,
          type: TransactionType.WITHDRAWAL,
          status: TransactionStatus.PENDING,
          referenceId: `WD-${Date.now()}`,
          description: `Wallet withdrawal of ${withdrawDto.amount}`,
          currency: 'INR',
        },
      });

      // Deduct from wallet atomically under lock
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            decrement: withdrawDto.amount,
          },
        },
      });

      return transaction;
    });
  }
}
