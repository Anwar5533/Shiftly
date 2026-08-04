import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ClsModule } from 'nestjs-cls';
import { v4 as uuidv4 } from 'uuid';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { WinstonModule } from 'nest-winston';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
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
import { KafkaModule } from './infrastructure/kafka/kafka.module';
import { OutboxModule } from './infrastructure/outbox/outbox.module';
// import { StorageModule } from './infrastructure/storage/storage.module';
// import { MailModule } from './infrastructure/mail/mail.module';
// import { OpenSearchModule } from './infrastructure/opensearch/opensearch.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { ShiftsModule } from './modules/shifts/shifts.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ClsModule.forRoot({ global: true, middleware: { mount: true, generateId: true, idGenerator: (req: any) => req.headers['x-trace-id'] ?? uuidv4() } }),
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
    KafkaModule,
    OutboxModule,
    // StorageModule,
    // MailModule,
    // OpenSearchModule,

    // ─── Domain Modules ───────────────────────────────────────────────────
    JobsModule,
    ShiftsModule,
    HealthModule,
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: {
        enabled: true,
      },
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        store: await redisStore({
          url: config.get<string>('REDIS_URL', 'redis://localhost:6379'),
          ttl: 30000, // 30 seconds
        }),
      }),
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
