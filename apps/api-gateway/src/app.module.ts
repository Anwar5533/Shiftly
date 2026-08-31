import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule, ThrottlerStorage } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { HealthModule } from './health/health.module';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';
import { RedisThrottlerStorage } from './shared/throttler/redis-throttler.storage';
import { gatewayEnvSchema } from './config/validation.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Local dev reads the app-local .env; containers and k8s inject real env
      // vars, so the file is skipped entirely in production.
      envFilePath: ['.env.local', '.env'],
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      validationSchema: gatewayEnvSchema,
      validationOptions: { allowUnknown: true, abortEarly: false },
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'default',
          ttl: Number(process.env.THROTTLE_TTL_MS ?? 60_000),
          limit: Number(process.env.THROTTLE_LIMIT ?? 100),
        },
      ],
    }),
    AuthModule,
    HealthModule,
    DashboardModule,
  ],
  providers: [
    // Global counting so the limit holds across gateway replicas.
    { provide: ThrottlerStorage, useClass: RedisThrottlerStorage },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
