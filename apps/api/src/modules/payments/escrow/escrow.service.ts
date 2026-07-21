import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { TransactionsService } from '../transactions/transactions.service';
import { WalletsService } from '../wallets/wallets.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class EscrowService {
  private readonly logger = new Logger(EscrowService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly transactionsService: TransactionsService,
    private readonly walletsService: WalletsService,
  ) {}

  async lockFunds(
    employerId: string,
    jobId: string,
    applicationId: string,
    amount: number,
  ) {
    if (amount <= 0) {
      throw new BadRequestException('Escrow amount must be positive');
    }

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const employerWallet = await this.walletsService.getWallet(employerId, tx);

      if (Number(employerWallet.balance) < amount) {
        throw new BadRequestException(
          'Insufficient balance to lock funds for this job',
        );
      }

      // Decrement main balance, increment escrow balance
      const updatedEmployerWallet = await tx.wallet.update({
        where: { id: employerWallet.id },
        data: {
          balance: { decrement: amount },
          escrowBalance: { increment: amount },
        },
      });

      if (Number(updatedEmployerWallet.balance) < 0) {
        throw new BadRequestException('Insufficient balance to lock funds for this job');
      }

      // Create EscrowLock
      const escrowLock = await tx.escrowLock.create({
        data: {
          walletId: employerWallet.id,
          jobId,
          applicationId,
          amount,
          currency: 'INR',
          status: 'LOCKED',
        },
      });

      // Log transaction
      await this.transactionsService.createTransaction({
        walletId: employerWallet.id,
        type: 'ESCROW_LOCK',
        amount: amount,
        description: `Funds locked in escrow for Job ${jobId}`,
        tx,
      });

      return escrowLock;
    });
  }

  async releaseFunds(timesheetId: string) {
    // When timesheet is approved, we need to release funds from employer's escrow to worker's balance
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const timesheet = await tx.timesheet.findUnique({
        where: { id: timesheetId },
        include: {
          shift: {
            include: {
              job: true,
              worker: true,
            },
          },
        },
      });

      if (!timesheet) throw new NotFoundException('Timesheet not found');

      const job = timesheet.shift.job;
      const workerId = timesheet.shift.worker.userId;
      const employerId = job.employerId;

      // Find the escrow lock associated with this job
      // Realistically we need the applicationId, but for our MVP let's find the first escrow lock for this job+wallet
      const employerWallet = await this.walletsService.getWallet(employerId, tx);
      const workerWallet = await this.walletsService.getWallet(workerId, tx);

      const escrowLock = await tx.escrowLock.findFirst({
        where: {
          jobId: job.id,
          walletId: employerWallet.id,
          status: 'LOCKED',
        },
      });

      if (!escrowLock) {
        this.logger.warn(`No locked escrow found for job ${job.id}`);
        return null;
      }

      // Calculate amount to release based on hours worked and hourly rate (or just release the full escrow for MVP)
      // We will release the full locked amount for simplicity here
      const releaseAmount = Number(escrowLock.amount);

      // Decrement employer escrow balance
      const updatedEmployerWallet = await tx.wallet.update({
        where: { id: employerWallet.id },
        data: {
          escrowBalance: { decrement: releaseAmount },
        },
      });
      
      if (Number(updatedEmployerWallet.escrowBalance) < 0) {
        throw new BadRequestException('Insufficient escrow balance for release');
      }

      // Increment worker balance
      await tx.wallet.update({
        where: { id: workerWallet.id },
        data: {
          balance: { increment: releaseAmount },
        },
      });

      // Mark escrow as released
      const updatedEscrow = await tx.escrowLock.update({
        where: { id: escrowLock.id },
        data: {
          status: 'RELEASED',
          releasedAt: new Date(),
        },
      });

      // Create transactions
      await this.transactionsService.createTransaction({
        walletId: employerWallet.id,
        type: 'ESCROW_RELEASE',
        amount: releaseAmount,
        description: `Escrow released to worker for Job ${job.title}`,
        tx,
      });

      await this.transactionsService.createTransaction({
        walletId: workerWallet.id,
        type: 'ESCROW_RELEASE', // Or could be considered a payment receipt
        amount: releaseAmount,
        description: `Payment received for Job ${job.title}`,
        tx,
      });

      return updatedEscrow;
    });
  }
}
