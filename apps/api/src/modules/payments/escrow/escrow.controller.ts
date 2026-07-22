/* eslint-disable prettier/prettier -- TODO(RC3): Address type safety */
import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { EscrowService } from './escrow.service';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';

@Controller('escrow')
@UseGuards(JwtAuthGuard)
export class EscrowController {
  constructor(private readonly escrowService: EscrowService) {}

  @Post('lock')
  async lockFunds(
    @Request() req: any,
    @Body() body: { jobId: string; applicationId: string; amount: number },
  ) {
    // Only employers can lock funds manually for testing, otherwise done via ApplicationsService
    return this.escrowService.lockFunds(
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      req.user.id,
      body.jobId,
      body.applicationId,
      body.amount,
    );
  }
}
