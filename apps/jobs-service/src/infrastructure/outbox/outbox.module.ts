import { Module, Global } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { OutboxService } from './outbox.service';

@Global()
@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [OutboxService],
  exports: [OutboxService],
})
export class OutboxModule {}
