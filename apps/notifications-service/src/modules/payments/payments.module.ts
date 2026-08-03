import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { WebhooksController } from './webhooks.controller';
import { WalletService } from './services/wallet.service';
import { EscrowService } from './services/escrow.service';

@Module({
  controllers: [PaymentsController, WebhooksController],
  providers: [WalletService, EscrowService],
  exports: [WalletService, EscrowService],
})
export class PaymentsModule {}
