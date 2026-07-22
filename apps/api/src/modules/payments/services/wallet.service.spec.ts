/* eslint-disable @typescript-eslint/no-unused-vars, prettier/prettier -- TODO(RC3): Address type safety */
import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { TransactionType, TransactionStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

describe('WalletService', () => {
  let service: WalletService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      wallet: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      transaction: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
      providers: [WalletService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<WalletService>(WalletService);
  });

  describe('getBalance', () => {
    it('should create wallet if not found', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      prisma.wallet.findUnique.mockResolvedValue(null);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      prisma.wallet.create.mockResolvedValue({
        id: 'wallet-1',
        balance: new Decimal(0),
      });

      const result = await service.getBalance('user-1');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      expect(prisma.wallet.create).toHaveBeenCalled();
      expect(result.id).toBe('wallet-1');
    });

    it('should return existing wallet', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      prisma.wallet.findUnique.mockResolvedValue({
        id: 'wallet-1',
        balance: new Decimal(100),
      });

      const result = await service.getBalance('user-1');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      expect(prisma.wallet.create).not.toHaveBeenCalled();
      expect(result.balance.toNumber()).toBe(100);
    });
  });

  describe('getTransactions', () => {
    it('should return transactions', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      prisma.transaction.findMany.mockResolvedValue([{ id: 'tx-1' }]);
      const result = await service.getTransactions('user-1');
      expect(result.length).toBe(1);
    });
  });

  describe('topup', () => {
    it('should add funds to wallet', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      prisma.wallet.findUnique.mockResolvedValue({
        id: 'wallet-1',
        balance: new Decimal(0),
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      prisma.transaction.create.mockResolvedValue({ id: 'tx-1' });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      prisma.wallet.update.mockResolvedValue({
        id: 'wallet-1',
        balance: new Decimal(100),
      });

      const result = await service.topup('user-1', {
        amount: 100,
        currency: 'INR',
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      expect(prisma.transaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
          data: expect.objectContaining({ type: TransactionType.TOPUP }),
        }),
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      expect(prisma.wallet.update).toHaveBeenCalled();
      expect(result.id).toBe('tx-1');
    });
  });

  describe('withdraw', () => {
    it('should throw BadRequestException if insufficient balance', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      prisma.wallet.findUnique.mockResolvedValue({
        id: 'wallet-1',
        balance: new Decimal(50),
      });
      await expect(
        service.withdraw('user-1', { amount: 100, bankAccountId: 'bank-1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should deduct funds and create withdrawal transaction', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      prisma.wallet.findUnique.mockResolvedValue({
        id: 'wallet-1',
        balance: new Decimal(200),
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      prisma.transaction.create.mockResolvedValue({ id: 'tx-1' });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      prisma.wallet.update.mockResolvedValue({
        id: 'wallet-1',
        balance: new Decimal(100),
      });

      const result = await service.withdraw('user-1', {
        amount: 100,
        bankAccountId: 'bank-1',
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      expect(prisma.transaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
          data: expect.objectContaining({ type: TransactionType.WITHDRAWAL }),
        }),
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      expect(prisma.wallet.update).toHaveBeenCalled();
      expect(result.id).toBe('tx-1');
    });
  });
});
