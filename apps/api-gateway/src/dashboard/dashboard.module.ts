import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    // Axios-level guardrails. DashboardService also applies a per-leg rxjs
    // deadline; this is the belt-and-braces floor so a wedged socket can never
    // hold a gateway worker open indefinitely.
    HttpModule.register({
      timeout: Number(process.env.DOWNSTREAM_TIMEOUT_MS ?? 5000),
      maxRedirects: 0,
      // Downstream 4xx/5xx must reject so Promise.allSettled marks the leg as
      // degraded instead of unwrapping an error body as data.
      validateStatus: (status: number) => status >= 200 && status < 300,
    }),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
