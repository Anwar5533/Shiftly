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
        { provide: WalletService, useValue: walletService },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<EscrowService>(EscrowService);
  });

  describe('createEscrow', () => {
    it('should throw BadRequestException if insufficient balance', async () => {
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
      walletService.getBalance.mockResolvedValue({
        id: 'wallet-1',
        balance: new Decimal(200),
      });
      prisma.wallet.update.mockResolvedValue({ id: 'wallet-1' });
      prisma.escrowLock.create.mockResolvedValue({ id: 'escrow-1' });

      const result = await service.createEscrow('emp-1', {
        jobId: 'job-1',
        applicationId: 'app-1',
        amount: 100,
      });
      expect(prisma.wallet.update).toHaveBeenCalled();
      expect(prisma.escrowLock.create).toHaveBeenCalled();
      expect(result.id).toBe('escrow-1');
    });
  });

  describe('releaseEscrow', () => {
    it('should throw NotFoundException if escrow not found', async () => {
      prisma.escrowLock.findUnique.mockResolvedValue(null);
      await expect(service.releaseEscrow('emp-1', 'escrow-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if wrong employer', async () => {
      prisma.escrowLock.findUnique.mockResolvedValue({
        id: 'escrow-1',
        wallet: { userId: 'emp-2' },
      });
      await expect(service.releaseEscrow('emp-1', 'escrow-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if escrow is not LOCKED', async () => {
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
      prisma.escrowLock.findUnique.mockResolvedValue({
        id: 'escrow-1',
        wallet: { userId: 'emp-1' },
        status: EscrowStatus.LOCKED,
        amount: new Decimal(100),
        application: { workerId: 'worker-1' },
      });
      prisma.escrowLock.update.mockResolvedValue({ id: 'escrow-1' });
      walletService.getBalance.mockResolvedValue({
        id: 'wallet-2',
        balance: new Decimal(0),
      });
      prisma.wallet.update.mockResolvedValue({ id: 'wallet-2' });

      const result = await service.releaseEscrow('emp-1', 'escrow-1');
      expect(prisma.escrowLock.update).toHaveBeenCalled();
      expect(prisma.wallet.update).toHaveBeenCalled();
      expect(result.message).toBe('Escrow released successfully');
    });
  });
});
