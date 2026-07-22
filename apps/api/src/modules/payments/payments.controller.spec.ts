/* eslint-disable prettier/prettier -- TODO(RC3): Address type safety */
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { WalletService } from './services/wallet.service';
import { EscrowService } from './services/escrow.service';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let walletService: any;
  let escrowService: any;

  beforeEach(async () => {
    walletService = {
      getBalance: jest.fn(),
      getTransactions: jest.fn(),
      topup: jest.fn(),
      withdraw: jest.fn(),
    };

    escrowService = {
      createEscrow: jest.fn(),
      releaseEscrow: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
        { provide: WalletService, useValue: walletService },
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
        { provide: EscrowService, useValue: escrowService },
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
  });

  describe('getWalletBalance', () => {
    it('should call getBalance', async () => {
      await controller.getWalletBalance('user-1');
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      expect(walletService.getBalance).toHaveBeenCalledWith('user-1');
    });
  });

  describe('getWalletTransactions', () => {
    it('should call getTransactions', async () => {
      await controller.getWalletTransactions('user-1');
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      expect(walletService.getTransactions).toHaveBeenCalledWith('user-1');
    });
  });

  describe('topupWallet', () => {
    it('should call topup', async () => {
      await controller.topupWallet('user-1', {
        amount: 100,
        currency: 'INR',
      });
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      expect(walletService.topup).toHaveBeenCalledWith('user-1', {
        amount: 100,
        currency: 'INR',
      });
    });
  });

  describe('withdrawFunds', () => {
    it('should call withdraw', async () => {
      await controller.withdrawFunds('user-1', {
        amount: 100,
        bankAccountId: 'bank-1',
      });
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      expect(walletService.withdraw).toHaveBeenCalledWith('user-1', {
        amount: 100,
        bankAccountId: 'bank-1',
      });
    });
  });

  describe('createEscrow', () => {
    it('should call createEscrow', async () => {
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- TODO(RC3): Address type safety
      await controller.createEscrow('emp-1', { amount: 100 } as any);
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      expect(escrowService.createEscrow).toHaveBeenCalledWith('emp-1', {
        amount: 100,
      });
    });
  });

  describe('releaseEscrow', () => {
    it('should call releaseEscrow', async () => {
      await controller.releaseEscrow('emp-1', 'escrow-1');
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      expect(escrowService.releaseEscrow).toHaveBeenCalledWith(
        'emp-1',
        'escrow-1',
      );
    });
  });
});
