import { Test, TestingModule } from '@nestjs/testing';
import { WebhooksController } from './webhooks.controller';
import { WalletService } from './services/wallet.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';

describe('WebhooksController', () => {
  let controller: WebhooksController;
  let walletService: { fulfillTopup: jest.Mock };
  const testSecret = 'dev_razorpay_webhook_secret';

  function createSignature(payload: unknown): string {
    const bodyStr = JSON.stringify(payload);
    return crypto.createHmac('sha256', testSecret).update(bodyStr).digest('hex');
  }

  beforeEach(async () => {
    walletService = {
      fulfillTopup: jest.fn().mockResolvedValue({ id: 'tx_1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhooksController],
      providers: [{ provide: WalletService, useValue: walletService }],
    }).compile();

    controller = module.get<WebhooksController>(WebhooksController);
  });

  describe('handleRazorpayWebhook', () => {
    it('should throw BadRequestException if signature is missing', async () => {
      await expect(controller.handleRazorpayWebhook('', {})).rejects.toThrow(BadRequestException);
    });

    it('should throw UnauthorizedException if signature is invalid', async () => {
      const payload = { event: 'payment.captured' };
      const invalidSig = 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
      await expect(controller.handleRazorpayWebhook(invalidSig, payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle payment.captured event and fulfill topup when signature is valid', async () => {
      const payload = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: { id: 'pay_123', order_id: 'order_123' },
          },
        },
      };

      const validSig = createSignature(payload);
      const result = await controller.handleRazorpayWebhook(validSig, payload);
      expect(result).toEqual({ received: true });
      expect(walletService.fulfillTopup).toHaveBeenCalledWith(
        'order_123',
        'pay_123',
        payload.payload.payment.entity,
      );
    });

    it('should handle other events without fulfilling topup', async () => {
      const payload = {
        event: 'payment.failed',
      };

      const validSig = createSignature(payload);
      const result = await controller.handleRazorpayWebhook(validSig, payload);
      expect(result).toEqual({ received: true });
      expect(walletService.fulfillTopup).not.toHaveBeenCalled();
    });
  });
});
