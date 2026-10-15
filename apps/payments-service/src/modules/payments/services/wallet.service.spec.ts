/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- Prisma Decimal mock in test */
import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { TransactionType, TransactionStatus } from '@prisma/client-payments-service';

describe('WalletService', () => {
  let service: WalletService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      $transaction: jest.fn(async (callback: (tx: any) => Promise<unknown>) => {
        return callback(prisma);
      }),
      $queryRaw: jest.fn(),
      wallet: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      transaction: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [WalletService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<WalletService>(WalletService);
  });

  describe('getBalance', () => {
    it('should create wallet if not found', async () => {
      prisma.wallet.findUnique.mockResolvedValue(null);

      prisma.wallet.create.mockResolvedValue({
        id: 'wallet-1',
        balance: 0,
      });

      const result = await service.getBalance('user-1');

      expect(prisma.wallet.create).toHaveBeenCalled();
      expect(result.id).toBe('wallet-1');
    });

    it('should return existing wallet', async () => {
      prisma.wallet.findUnique.mockResolvedValue({
        id: 'wallet-1',
        balance: 100,
      });

      const result = await service.getBalance('user-1');

      expect(prisma.wallet.create).not.toHaveBeenCalled();
      expect(Number(result.balance)).toBe(100);
    });
  });

  describe('getTransactions', () => {
    it('should return transactions', async () => {
      prisma.transaction.findMany.mockResolvedValue([{ id: 'tx-1' }]);
      const result = await service.getTransactions('user-1');
      expect(result.length).toBe(1);
    });
  });

  describe('topup', () => {
    it('should create a pending transaction without directly incrementing balance', async () => {
      prisma.wallet.findUnique.mockResolvedValue({
        id: 'wallet-1',
        balance: 0,
      });

      prisma.transaction.create.mockResolvedValue({
        id: 'tx-1',
        status: TransactionStatus.PENDING,
        amount: 100,
      });

      const result = await service.topup('user-1', {
        amount: 100,
        currency: 'INR',
      });

      expect(prisma.transaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: TransactionType.TOPUP,
            status: TransactionStatus.PENDING,
            amount: 100,
          }),
        }),
      );

      // Verify wallet balance is NOT incremented directly
      expect(prisma.wallet.update).not.toHaveBeenCalled();
      expect(result.id).toBe('tx-1');
      expect(result.orderId).toBeDefined();
    });

    it('should throw BadRequestException if amount is less than or equal to 0', async () => {
      await expect(service.topup('user-1', { amount: 0, currency: 'INR' })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('fulfillTopup', () => {
    it('should fulfill pending transaction and atomically increment balance', async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        id: 'tx-1',
        walletId: 'wallet-1',
        amount: 100,
        status: TransactionStatus.PENDING,
      });

      prisma.wallet.update.mockResolvedValue({ id: 'wallet-1', balance: 100 });
      prisma.transaction.update.mockResolvedValue({
        id: 'tx-1',
        status: TransactionStatus.COMPLETED,
        externalTxnId: 'pay_123',
      });

      const result = await service.fulfillTopup('order_123', 'pay_123');

      expect(prisma.wallet.update).toHaveBeenCalledWith({
        where: { id: 'wallet-1' },
        data: { balance: { increment: 100 } },
      });
      expect(prisma.transaction.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'tx-1' },
          data: expect.objectContaining({
            status: TransactionStatus.COMPLETED,
            externalTxnId: 'pay_123',
          }),
        }),
      );
      expect(result?.status).toBe(TransactionStatus.COMPLETED);
    });

    it('should be idempotent and return transaction without crediting again if already completed', async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        id: 'tx-1',
        walletId: 'wallet-1',
        amount: 100,
        status: TransactionStatus.COMPLETED,
      });

      const result = await service.fulfillTopup('order_123', 'pay_123');

      expect(prisma.wallet.update).not.toHaveBeenCalled();
      expect(result?.status).toBe(TransactionStatus.COMPLETED);
    });
  });

  describe('withdraw', () => {
    it('should throw BadRequestException if insufficient balance', async () => {
      prisma.$queryRaw.mockResolvedValue([{ id: 'wallet-1', balance: 50, userId: 'user-1' }]);
      await expect(
        service.withdraw('user-1', { amount: 100, bankAccountId: 'bank-1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should deduct funds and create withdrawal transaction under row lock', async () => {
      prisma.$queryRaw.mockResolvedValue([{ id: 'wallet-1', balance: 200, userId: 'user-1' }]);

      prisma.transaction.create.mockResolvedValue({ id: 'tx-1' });

      prisma.wallet.update.mockResolvedValue({
        id: 'wallet-1',
        balance: 100,
      });

      const result = await service.withdraw('user-1', {
        amount: 100,
        bankAccountId: 'bank-1',
      });

      expect(prisma.$queryRaw).toHaveBeenCalled();
      expect(prisma.transaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ type: TransactionType.WITHDRAWAL }),
        }),
      );

      expect(prisma.wallet.update).toHaveBeenCalledWith({
        where: { id: 'wallet-1' },
        data: { balance: { decrement: 100 } },
      });
      expect(result.id).toBe('tx-1');
    });
  });
});
