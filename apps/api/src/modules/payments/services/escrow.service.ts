import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { WalletService } from './wallet.service';
import { CreateEscrowDto } from '../dto/create-escrow.dto';
import { EscrowStatus } from '@prisma/client';

@Injectable()
export class EscrowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
  ) {}

  async createEscrow(employerId: string, createEscrowDto: CreateEscrowDto) {
    const employerWallet = await this.walletService.getBalance(employerId);

    if (employerWallet.balance.toNumber() < createEscrowDto.amount) {
      throw new BadRequestException('Insufficient wallet balance to fund this escrow. Please top up your wallet.');
    }

    // Deduct funds from employer's wallet to lock them in escrow
    await this.prisma.wallet.update({
      where: { id: employerWallet.id },
      data: {
        balance: {
          decrement: createEscrowDto.amount,
        },
      },
    });

    // Create the escrow record
    const escrow = await this.prisma.escrowLock.create({
      data: {
        jobId: createEscrowDto.jobId,
        walletId: employerWallet.id,
        applicationId: createEscrowDto.applicationId,
        amount: createEscrowDto.amount,
        currency: 'INR',
        status: EscrowStatus.LOCKED,
      },
    });

    return escrow;
  }

  async releaseEscrow(employerId: string, escrowId: string) {
    const escrow = await this.prisma.escrowLock.findUnique({
      where: { id: escrowId },
      include: { wallet: true, application: true }
    });

    if (!escrow) {
      throw new NotFoundException('Escrow not found');
    }

    if (escrow.wallet.userId !== employerId) {
      throw new BadRequestException('You do not have permission to release this escrow');
    }

    if (escrow.status !== EscrowStatus.LOCKED) {
      throw new BadRequestException(`Cannot release escrow in ${escrow.status} status`);
    }

    // Mark escrow as released
    await this.prisma.escrowLock.update({
      where: { id: escrowId },
      data: { status: EscrowStatus.RELEASED, releasedAt: new Date() },
    });

    // Add funds to worker's wallet
    const workerWallet = await this.walletService.getBalance(escrow.application.workerId);
    
    await this.prisma.wallet.update({
      where: { id: workerWallet.id },
      data: {
        balance: {
          increment: escrow.amount,
        },
      },
    });

    return { message: 'Escrow released successfully' };
  }
}
