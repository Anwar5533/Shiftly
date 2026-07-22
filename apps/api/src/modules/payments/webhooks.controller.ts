/* eslint-disable prettier/prettier -- TODO(RC3): Address type safety */
import {
  Controller,
  Post,
  Body,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { WalletService } from './services/wallet.service';
import { Public } from '../../shared/decorators/public.decorator';

@Controller({ path: 'webhooks/payments', version: '1' })
export class WebhooksController {
  constructor(private readonly walletService: WalletService) {}

  @Post('razorpay')
  @Public()
// eslint-disable-next-line @typescript-eslint/require-await -- TODO(RC3): Address type safety
  async handleRazorpayWebhook(
    @Headers('x-razorpay-signature') signature: string,
    @Body() payload: any,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing Razorpay signature');
    }

    // In a real app, verify signature using crypto module and razorpay webhook secret
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
    const event = payload.event;

    if (event === 'payment.captured') {
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      const paymentEntity = payload.payload.payment.entity;

      // We would lookup the transaction by reference ID or order ID,
      // verify amount, and then fulfill the top-up/wallet update.
      console.log('Payment Captured:', paymentEntity);

      // Return 200 OK so Razorpay knows we received it
      return { received: true };
    }

    return { received: true };
  }
}
