/* eslint-disable prettier/prettier -- TODO(RC3): Address type safety */
import './tracing';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import helmet from 'helmet';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './shared/filters/global-exception.filter';
import { TransformInterceptor } from './shared/interceptors/transform.interceptor';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // ─── Logger ───────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- TODO(RC3): Address type safety
  app.useLogger(logger);

  // ─── Config ───────────────────────────────────────────────────────────────
  const config = app.get(ConfigService);
  const port = config.get<number>('app.port', 3001);
  const nodeEnv = config.get<string>('app.nodeEnv', 'development');
  const corsOrigins = config.get<string[]>('app.corsOrigins', [
    'http://localhost:5173',
  ]);

  // ─── Security ─────────────────────────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: nodeEnv === 'production',
      crossOriginEmbedderPolicy: nodeEnv === 'production',
    }),
  );
  app.use(compression());
  app.use(cookieParser());

  // ─── CORS ─────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Request-ID',
      'Idempotency-Key',
    ],
    exposedHeaders: ['X-Request-ID'],
  });

  // ─── API Versioning ───────────────────────────────────────────────────────
  app.enableVersioning({ type: VersioningType.URI });
  app.setGlobalPrefix('api');

  // ─── Global Validation Pipe ───────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ─── Global Filters & Interceptors ────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- TODO(RC3): Address type safety
  app.useGlobalFilters(new GlobalExceptionFilter(logger));
  app.useGlobalInterceptors(
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- TODO(RC3): Address type safety
    new LoggingInterceptor(logger),
    new TransformInterceptor(),
  );

  // ─── Swagger / OpenAPI ────────────────────────────────────────────────────
  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('SHIFTLY API')
      .setDescription(
        'Enterprise Workforce Marketplace — Complete API Reference\n\n' +
          'Authentication: Use Bearer token in the Authorize button.\n' +
          'OTP Login: POST /api/v1/auth/otp/send → POST /api/v1/auth/otp/verify',
      )
      .setVersion('1.0.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
        'JWT',
      )
      .addServer(`http://localhost:${port}`, 'Local Development')
      .addServer('https://api-staging.shiftly.com', 'Staging')
      .addServer('https://api.shiftly.com', 'Production')
      .addTag('Auth', 'Authentication & session management')
      .addTag('Jobs', 'Job listings, shifts, and gig work')
      .addTag('Applications', 'Job applications and candidate management')
      .addTag('Workers', 'Worker profiles and availability')
      .addTag('Employers', 'Employer profiles and company management')
      .addTag('Payments', 'Wallet, escrow, and transactions')
      .addTag('Chat', 'Real-time messaging')
      .addTag('Notifications', 'Notification management')
      .addTag('Reviews', 'Ratings and reviews')
      .addTag('Search', 'Global search')
      .addTag('AI', 'AI-powered features')
      .addTag('KYC', 'Identity verification')
      .addTag('Admin', 'Platform administration')
      .addTag('Analytics', 'Reports and analytics')
      .addTag('Subscriptions', 'Subscription plans')
      .addTag('Referrals', 'Referral system')
      .addTag('Health', 'Health checks')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });
  }

  // ─── Graceful Shutdown ────────────────────────────────────────────────────
  app.enableShutdownHooks();

  // ─── Start Server ─────────────────────────────────────────────────────────
  await app.listen(port, '0.0.0.0');
// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
  logger.log(
    `🚀 SHIFTLY API running on http://localhost:${port}/api/v1`,
    'Bootstrap',
  );
// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
  logger.log(
    `📚 Swagger docs at http://localhost:${port}/api/docs`,
    'Bootstrap',
  );
// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
  logger.log(`🌍 Environment: ${nodeEnv}`, 'Bootstrap');
}

bootstrap().catch((error: unknown) => {
  console.error('Fatal error during bootstrap:', error);
  process.exit(1);
});
