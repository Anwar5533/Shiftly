import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { DownstreamHealthIndicator } from './downstream-health.indicator';

@Module({
  imports: [
    TerminusModule,
    HttpModule.register({
      timeout: Number(process.env.HEALTH_PROBE_TIMEOUT_MS ?? 2000),
      maxRedirects: 0,
    }),
  ],
  controllers: [HealthController],
  providers: [DownstreamHealthIndicator],
})
export class HealthModule {}
