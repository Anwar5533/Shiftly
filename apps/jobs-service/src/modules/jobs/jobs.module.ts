import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { ShiftsService } from './shifts.service';
import { ShiftsController } from './shifts.controller';

@Module({
  imports: [],
  controllers: [JobsController, ShiftsController],
  providers: [JobsService, ShiftsService],
  exports: [JobsService, ShiftsService],
})
export class JobsModule {}
