/* eslint-disable prettier/prettier -- TODO(RC3): Address type safety */
import { Test, TestingModule } from '@nestjs/testing';
import { EscrowService } from './escrow.service';
import { WalletService } from './wallet.service';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EscrowStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

describe('EscrowService', () => {
  let service: EscrowService;
  let walletService: any;
  let prisma: any;

  beforeEach(async () => {
    walletService = {
      getBalance: jest.fn(),
    };

    prisma = {
      wallet: {
        update: jest.fn(),
      },
      escrowLock: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EscrowService,
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
        { provide: WalletService, useValue: walletService },
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<EscrowService>(EscrowService);
  });

  describe('createEscrow', () => {
    it('should throw BadRequestException if insufficient balance', async () => {
// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      walletService.getBalance.mockResolvedValue({
        id: 'wallet-1',
        balance: new Decimal(50),
      });
      await expect(
        service.createEscrow('emp-1', {
          jobId: 'job-1',
          applicationId: 'app-1',
          amount: 100,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should deduct from wallet and create escrow', async () => {
// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      walletService.getBalance.mockResolvedValue({
        id: 'wallet-1',
        balance: new Decimal(200),
      });
// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      prisma.wallet.update.mockResolvedValue({ id: 'wallet-1' });
// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      prisma.escrowLock.create.mockResolvedValue({ id: 'escrow-1' });

      const result = await service.createEscrow('emp-1', {
        jobId: 'job-1',
        applicationId: 'app-1',
        amount: 100,
      });
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      expect(prisma.wallet.update).toHaveBeenCalled();
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      expect(prisma.escrowLock.create).toHaveBeenCalled();
      expect(result.id).toBe('escrow-1');
    });
  });

  describe('releaseEscrow', () => {
    it('should throw NotFoundException if escrow not found', async () => {
// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      prisma.escrowLock.findUnique.mockResolvedValue(null);
      await expect(service.releaseEscrow('emp-1', 'escrow-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if wrong employer', async () => {
// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      prisma.escrowLock.findUnique.mockResolvedValue({
        id: 'escrow-1',
        wallet: { userId: 'emp-2' },
      });
      await expect(service.releaseEscrow('emp-1', 'escrow-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if escrow is not LOCKED', async () => {
// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      prisma.escrowLock.findUnique.mockResolvedValue({
        id: 'escrow-1',
        wallet: { userId: 'emp-1' },
        status: EscrowStatus.RELEASED,
      });
      await expect(service.releaseEscrow('emp-1', 'escrow-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should release escrow and add to worker wallet', async () => {
// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      prisma.escrowLock.findUnique.mockResolvedValue({
        id: 'escrow-1',
        wallet: { userId: 'emp-1' },
        status: EscrowStatus.LOCKED,
        amount: new Decimal(100),
        application: { workerId: 'worker-1' },
      });
// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      prisma.escrowLock.update.mockResolvedValue({ id: 'escrow-1' });
// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      walletService.getBalance.mockResolvedValue({
        id: 'wallet-2',
        balance: new Decimal(0),
      });
// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      prisma.wallet.update.mockResolvedValue({ id: 'wallet-2' });

      const result = await service.releaseEscrow('emp-1', 'escrow-1');
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      expect(prisma.escrowLock.update).toHaveBeenCalled();
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      expect(prisma.wallet.update).toHaveBeenCalled();
      expect(result.message).toBe('Escrow released successfully');
    });
  });
});
