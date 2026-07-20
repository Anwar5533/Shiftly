import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { WalletService } from './services/wallet.service';
import { EscrowService } from './services/escrow.service';
import { TopupWalletDto } from './dto/topup-wallet.dto';
import { WithdrawFundsDto } from './dto/withdraw-funds.dto';
import { CreateEscrowDto } from './dto/create-escrow.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller({ path: 'payments', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(
    private readonly walletService: WalletService,
    private readonly escrowService: EscrowService,
  ) {}

  @Get('wallet/balance')
  getWalletBalance(@CurrentUser('sub') userId: string) {
    return this.walletService.getBalance(userId);
  }

  @Get('wallet/transactions')
  getWalletTransactions(@CurrentUser('sub') userId: string) {
    return this.walletService.getTransactions(userId);
  }

  @Post('wallet/topup')
  topupWallet(
    @CurrentUser('sub') userId: string,
    @Body() topupDto: TopupWalletDto,
  ) {
    return this.walletService.topup(userId, topupDto);
  }

  @Post('wallet/withdraw')
  withdrawFunds(
    @CurrentUser('sub') userId: string,
    @Body() withdrawDto: WithdrawFundsDto,
  ) {
    return this.walletService.withdraw(userId, withdrawDto);
  }

  @Post('escrow/create')
  @Roles(UserRole.EMPLOYER)
  createEscrow(
    @CurrentUser('sub') employerId: string,
    @Body() createEscrowDto: CreateEscrowDto,
  ) {
    return this.escrowService.createEscrow(employerId, createEscrowDto);
  }

  @Post('escrow/:id/release')
  @Roles(UserRole.EMPLOYER)
  releaseEscrow(
    @CurrentUser('sub') employerId: string,
    @Param('id') escrowId: string,
  ) {
    return this.escrowService.releaseEscrow(employerId, escrowId);
  }
}
