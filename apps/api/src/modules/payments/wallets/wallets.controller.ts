import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';

@Controller('wallets')
@UseGuards(JwtAuthGuard)
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get('me')
  async getMyWallet(@Request() req: any) {
    return this.walletsService.getWallet(req.user.id);
  }

  @Get('me/transactions')
  async getMyTransactions(@Request() req: any) {
    return this.walletsService.getTransactions(req.user.id);
  }

  @Post('topup')
  async topUp(@Request() req: any, @Body('amount') amount: number) {
    return this.walletsService.topUp(req.user.id, amount);
  }

  @Post('withdraw')
  async withdraw(@Request() req: any, @Body('amount') amount: number) {
    return this.walletsService.withdraw(req.user.id, amount);
  }
}
