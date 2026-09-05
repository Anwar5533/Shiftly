import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { TransactionsService } from '../transactions/transactions.service';
import { Prisma } from '@prisma/client-payments-service';

@Injectable()
export class WalletsService {
  private readonly logger = new Logger(WalletsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly transactionsService: TransactionsService,
  ) {}

  async getWallet(userId: string, tx?: Prisma.TransactionClient) {
    const client = tx || this.prisma;

    let wallet = await client.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      wallet = await client.wallet.create({
        data: {
          userId,
          balance: 0,
          escrowBalance: 0,
          currency: 'INR',
        },
      });
    }

    return wallet;
  }

  async getTransactions(userId: string) {
    const wallet = await this.getWallet(userId);
    return this.transactionsService.getTransactions(wallet.id);
  }

  async topUp(userId: string, amount: number, paymentMethodId?: string) {
    if (amount <= 0) {
      throw new BadRequestException('Top up amount must be greater than 0');
    }

    // --- MOCK STRIPE PAYLOAD PROCESSING ---
    if (paymentMethodId) {
      this.logger.log(`Processing Stripe payment for user ${userId} with method ${paymentMethodId} for amount ${amount}`);
      // Simulate network delay to Stripe API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simulate Stripe decline on specific token
      if (paymentMethodId === 'tok_chargeDeclined') {
        throw new BadRequestException('Stripe Charge Declined: Insufficient funds or card blocked.');
      }
      this.logger.log(`Stripe payment successful (Mocked)`);
    }
    // ----------------------------------------

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { increment: amount },
        },
      });

      await this.transactionsService.createTransaction({
        walletId: wallet.id,
        type: 'TOPUP',
        amount,
        description: 'Wallet top-up',
        tx,
      });

      return updatedWallet;
    });
  }

  async withdraw(userId: string, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('Withdraw amount must be greater than 0');
    }

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      if (Number(wallet.balance) < amount) {
        throw new BadRequestException('Insufficient balance');
      }

      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { decrement: amount },
        },
      });

      if (Number(updatedWallet.balance) < 0) {
        throw new BadRequestException('Insufficient balance');
      }

      await this.transactionsService.createTransaction({
        walletId: wallet.id,
        type: 'WITHDRAWAL',
        amount,
        description: 'Wallet withdrawal',
        tx,
      });

      return updatedWallet;
    });
  }
}
