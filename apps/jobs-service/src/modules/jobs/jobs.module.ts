import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { ShiftsService } from './shifts.service';
import { ShiftsController } from './shifts.controller';
import { TimesheetsService } from './timesheets.service';
import { TimesheetsController } from './timesheets.controller';
import { EscrowModule } from '../payments/escrow/escrow.module';

@Module({
  imports: [EscrowModule],
  controllers: [JobsController, ShiftsController, TimesheetsController],
  providers: [JobsService, ShiftsService, TimesheetsService],
  exports: [JobsService, ShiftsService, TimesheetsService],
})
export class JobsModule {}
