import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { TopupWalletDto } from '../dto/topup-wallet.dto';
import { WithdrawFundsDto } from '../dto/withdraw-funds.dto';
import { TransactionType, TransactionStatus } from '@prisma/client';

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
    const wallet = await this.getBalance(userId);

    // Mocking an external payment gateway call here
    // In production, this would initialize a Razorpay/Stripe session
    const transaction = await this.prisma.transaction.create({
      data: {
        walletId: wallet.id,
        amount: topupDto.amount,
        type: TransactionType.TOPUP,
        status: TransactionStatus.COMPLETED, // Mocking successful payment
        referenceId: `TOPUP-${Date.now()}`,
        description: `Wallet top up of ${topupDto.amount}`,
        currency: 'INR',
      },
    });

    // Update wallet balance
    await this.prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: {
          increment: topupDto.amount,
        },
      },
    });

    return transaction;
  }

  async withdraw(userId: string, withdrawDto: WithdrawFundsDto) {
    const wallet = await this.getBalance(userId);

    if (wallet.balance.toNumber() < withdrawDto.amount) {
      throw new BadRequestException('Insufficient balance');
    }

    // Mocking withdrawal processing
    const transaction = await this.prisma.transaction.create({
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

    // Deduct from wallet immediately
    await this.prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: {
          decrement: withdrawDto.amount,
        },
      },
    });

    return transaction;
  }
}
