import {
  Controller,
  Post,
  Body,
  Headers,
  Req,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import type { Request } from 'express';
import * as crypto from 'crypto';
import { WalletService } from './services/wallet.service';
import { Public } from '../../shared/decorators/public.decorator';

interface RazorpayPaymentEntity {
  id?: string;
  order_id?: string;
  amount?: number;
  currency?: string;
  status?: string;
  [key: string]: unknown;
}

interface RazorpayWebhookPayload {
  event?: string;
  payload?: {
    payment?: {
      entity?: RazorpayPaymentEntity;
    };
    order?: {
      entity?: {
        id?: string;
        [key: string]: unknown;
      };
    };
  };
}

@Controller({ path: 'webhooks/payments', version: '1' })
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(private readonly walletService: WalletService) {}

  @Post('razorpay')
  @Public()
  async handleRazorpayWebhook(
    @Headers('x-razorpay-signature') signature: string,
    @Body() payload: RazorpayWebhookPayload,
    @Req() req?: Request & { rawBody?: Buffer },
  ) {
    if (!signature) {
      throw new BadRequestException('Missing Razorpay signature');
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'dev_razorpay_webhook_secret';

    // Verify HMAC-SHA256 signature against raw body Buffer or serialized payload
    const bodyBuffer =
      req?.rawBody || Buffer.from(typeof payload === 'string' ? payload : JSON.stringify(payload));
    const expectedSignature = crypto.createHmac('sha256', secret).update(bodyBuffer).digest('hex');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      this.logger.warn('Razorpay webhook HMAC signature verification failed');
      throw new UnauthorizedException('Invalid Razorpay webhook signature');
    }

    const event = payload?.event;
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload?.payload?.payment?.entity;
      const orderId =
        paymentEntity?.order_id || paymentEntity?.id || payload?.payload?.order?.entity?.id;
      const externalTxnId = paymentEntity?.id;

      if (orderId && externalTxnId) {
        this.logger.log(`Fulfilling top-up for order ${orderId} (externalTxn: ${externalTxnId})`);
        await this.walletService.fulfillTopup(orderId, externalTxnId, paymentEntity);
      }
    }

    return { received: true };
  }
}
