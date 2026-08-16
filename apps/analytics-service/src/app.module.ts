import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { WinstonModule } from 'nest-winston';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RetryInterceptor } from './shared/interceptors/retry.interceptor';
import { IdempotencyInterceptor } from './shared/interceptors/idempotency.interceptor';
import { appConfig } from './config/app.config';
import { databaseConfig } from './config/database.config';
import { redisConfig } from './config/redis.config';
import { kafkaConfig } from './config/kafka.config';
import { awsConfig } from './config/aws.config';
import { jwtConfig } from './config/jwt.config';
import { createWinstonConfig } from './config/logger.config';
import { validationSchema } from './config/validation.schema';
import { PrismaModule } from './infrastructure/database/prisma.module';
import { RedisModule } from './infrastructure/redis/redis.module';
// import { KafkaModule } from './infrastructure/kafka/kafka.module';
// import { StorageModule } from './infrastructure/storage/storage.module';
// import { MailModule } from './infrastructure/mail/mail.module';
// import { OpenSearchModule } from './infrastructure/opensearch/opensearch.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    // ─── Configuration ───────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.APP_ENV ? `.env.${process.env.APP_ENV}` : '.env',
      load: [appConfig, databaseConfig, redisConfig, kafkaConfig, awsConfig, jwtConfig],
      validationSchema,
      validationOptions: {
        allowUnknown: false,
        abortEarly: false,
      },
      cache: true,
      expandVariables: true,
    }),

    // ─── Logging ──────────────────────────────────────────────────────────
    WinstonModule.forRootAsync({
      useFactory: (/* configService: ConfigService */) => createWinstonConfig(),
      // inject: [ConfigService],
    }),

    // ─── Rate Limiting ────────────────────────────────────────────────────
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 },
      { name: 'medium', ttl: 60000, limit: 100 },
      { name: 'long', ttl: 900000, limit: 300 },
    ]),

    // ─── Event System (in-process) ────────────────────────────────────────
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 20,
      verboseMemoryLeak: true,
    }),

    // ─── Task Scheduling ──────────────────────────────────────────────────
    ScheduleModule.forRoot(),

    // ─── Infrastructure ───────────────────────────────────────────────────
    PrismaModule,
    RedisModule,
    // KafkaModule,
    // StorageModule,
    // MailModule,
    // OpenSearchModule,

    // ─── Domain Modules ───────────────────────────────────────────────────
    AnalyticsModule,
    HealthModule,
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: {
        enabled: true,
      },
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 5000, // 5 seconds default
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RetryInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: IdempotencyInterceptor,
    },
  ],
})
export class AppModule {}
