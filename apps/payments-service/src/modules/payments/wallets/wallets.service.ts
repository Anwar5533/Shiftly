import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
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

  async topUp(userId: string, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('Top up amount must be greater than 0');
    }

    const wallet = await this.getWallet(userId);
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Create PENDING transaction. Balance is NOT directly incremented until payment is verified.
    const transaction = await this.prisma.transaction.create({
      data: {
        walletId: wallet.id,
        type: 'TOPUP',
        amount,
        currency: 'INR',
        status: 'PENDING',
        referenceId: orderId,
        description: `Wallet top-up of ${amount} INR`,
      },
    });

    return {
      orderId,
      transactionId: transaction.id,
      amount,
      currency: 'INR',
      status: 'PENDING',
      message: 'Payment session initiated. Complete payment via payment gateway to credit funds.',
    };
  }

  async fulfillTopUp(orderIdOrRef: string, externalTxnId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        OR: [{ referenceId: orderIdOrRef }, { id: orderIdOrRef }],
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status === 'COMPLETED') {
      return { alreadyProcessed: true, transaction };
    }

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updatedWallet = await tx.wallet.update({
        where: { id: transaction.walletId },
        data: {
          balance: { increment: transaction.amount },
        },
      });

      const updatedTx = await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'COMPLETED',
          externalTxnId,
        },
      });

      return { wallet: updatedWallet, transaction: updatedTx };
    });
  }

  async verifyPayment(userId: string, orderId: string, paymentId: string, signature: string) {
    const secret =
      process.env.RAZORPAY_KEY_SECRET ||
      process.env.RAZORPAY_WEBHOOK_SECRET ||
      'dev_razorpay_webhook_secret';

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      throw new BadRequestException('Invalid payment signature');
    }

    return this.fulfillTopUp(orderId, paymentId);
  }

  async withdraw(userId: string, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('Withdraw amount must be greater than 0');
    }

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Row-level lock (FOR UPDATE) to prevent concurrent overdraft race conditions
      const wallets = await tx.$queryRaw<Array<{ id: string; balance: any; userId: string }>>`
        SELECT id, balance, "userId"
        FROM payments.wallets
        WHERE "userId" = ${userId}::uuid
        FOR UPDATE
      `;

      const wallet = wallets[0];
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
