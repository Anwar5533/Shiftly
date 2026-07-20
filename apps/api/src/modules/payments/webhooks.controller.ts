import { Controller, Post, Body, Headers, BadRequestException } from '@nestjs/common';
import { WalletService } from './services/wallet.service';
import { Public } from '../../shared/decorators/public.decorator';

@Controller({ path: 'webhooks/payments', version: '1' })
export class WebhooksController {
  constructor(private readonly walletService: WalletService) {}

  @Post('razorpay')
  @Public()
  async handleRazorpayWebhook(
    @Headers('x-razorpay-signature') signature: string,
    @Body() payload: any,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing Razorpay signature');
    }

    // In a real app, verify signature using crypto module and razorpay webhook secret
    const event = payload.event;

    if (event === 'payment.captured') {
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
