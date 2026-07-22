/* eslint-disable prettier/prettier -- TODO(RC3): Address type safety */
import { Test, TestingModule } from '@nestjs/testing';
import { WebhooksController } from './webhooks.controller';
import { WalletService } from './services/wallet.service';
import { BadRequestException } from '@nestjs/common';

describe('WebhooksController', () => {
  let controller: WebhooksController;
  let walletService: any;

  beforeEach(async () => {
    walletService = {};

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhooksController],
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
      providers: [{ provide: WalletService, useValue: walletService }],
    }).compile();

    controller = module.get<WebhooksController>(WebhooksController);
  });

  describe('handleRazorpayWebhook', () => {
    it('should throw BadRequestException if signature is missing', async () => {
      await expect(controller.handleRazorpayWebhook('', {})).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle payment.captured event', async () => {
      const payload = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: { id: 'pay_123' },
          },
        },
      };

      const result = await controller.handleRazorpayWebhook(
        'signature',
        payload,
      );
      expect(result).toEqual({ received: true });
    });

    it('should handle other events', async () => {
      const payload = {
        event: 'payment.failed',
      };

      const result = await controller.handleRazorpayWebhook(
        'signature',
        payload,
      );
      expect(result).toEqual({ received: true });
    });
  });
});
