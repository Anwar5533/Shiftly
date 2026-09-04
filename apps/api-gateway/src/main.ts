import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { createProxyMiddleware, type Options } from 'http-proxy-middleware';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Socket } from 'node:net';
import { v4 as uuidv4 } from 'uuid';
import { AppModule } from './app.module';

/**
 * Path prefix → downstream env var. Ordered longest-first at match time so
 * `/api/v1/webhooks/payments` can never be shadowed by a broader entry.
 */
const ROUTE_TABLE: ReadonlyArray<readonly [prefix: string, envVar: string]> = [
  ['/api/v1/auth', 'IDENTITY_URL'],
  ['/api/v1/workers', 'USER_URL'],
  ['/api/v1/employers', 'USER_URL'],
  ['/api/v1/recruiters', 'USER_URL'],
  ['/api/v1/kyc', 'USER_URL'],
  ['/api/v1/jobs', 'JOBS_URL'],
  ['/api/v1/shifts', 'JOBS_URL'],
  ['/api/v1/timesheets', 'JOBS_URL'],
  ['/api/v1/applications', 'APPLICATIONS_URL'],
  ['/api/v1/analytics', 'ANALYTICS_URL'],
  ['/api/v1/search', 'SEARCH_URL'],
  ['/api/v1/webhooks/payments', 'PAYMENTS_URL'],
  ['/api/v1/payments', 'PAYMENTS_URL'],
  ['/api/v1/escrow', 'PAYMENTS_URL'],
  ['/api/v1/wallets', 'PAYMENTS_URL'],
  ['/api/v1/documents', 'DOCUMENTS_URL'],
  ['/api/v1/notifications', 'NOTIFICATIONS_URL'],
];

const SORTED_ROUTES = [...ROUTE_TABLE].sort((a, b) => b[0].length - a[0].length);

function resolveTarget(url: string): string | undefined {
  const path = url.split('?')[0];
  return SORTED_ROUTES.find(([prefix]) => path === prefix || path.startsWith(`${prefix}/`))?.[1];
}

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');

  // Required downstream URLs and secrets are enforced by `gatewayEnvSchema`
  // inside ConfigModule, so a misconfigured gateway dies here rather than
  // serving 500s with a healthy-looking probe.
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
    bufferLogs: true,
  });

  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(compression());
  app.enableShutdownHooks();

  const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    exposedHeaders: ['X-Request-ID'],
  });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );

  app.setGlobalPrefix('api/v1', {
    // `/health/*` stays unprefixed so kubelet needs no knowledge of API versions.
    exclude: ['health/live', 'health/ready', 'health/startup'],
  });

  const timeoutMs = Number(process.env.DOWNSTREAM_TIMEOUT_MS ?? 5000);

  const proxyOptions: Options = {
    changeOrigin: true,
    // Streaming the untouched body matters because bodyParser is disabled: the
    // gateway must not buffer or re-encode uploads on their way to
    // documents-service. Both timeouts are set so a hung downstream surfaces as
    // a 502 from us instead of a 504 from the ingress.
    proxyTimeout: timeoutMs,
    timeout: timeoutMs,
    router: (req: IncomingMessage) => {
      const envVar = resolveTarget(req.url ?? '');
      // Unreachable in practice: the dispatcher below only forwards matched
      // paths. Throwing rather than returning '' keeps a routing-table typo
      // from silently proxying to an empty target.
      if (!envVar) {
        throw new Error(`No proxy target for ${req.url ?? '<no url>'}`);
      }
      let target = process.env[envVar] || '';
      if (target.endsWith('/api/v1')) {
        target = target.slice(0, -7);
      }
      return target;
    },
    on: {
      error: (err: Error, req: IncomingMessage, res: ServerResponse | Socket) => {
        logger.error(`Proxy error for ${req.method ?? 'GET'} ${req.url ?? ''}: ${err.message}`);
        if (!('setHeader' in res) || res.headersSent) {
          res.destroy();
          return;
        }
        const requestId = (req.headers['x-request-id'] as string) ?? uuidv4();
        res.writeHead(502, { 'Content-Type': 'application/json', 'X-Request-ID': requestId });
        res.end(
          JSON.stringify({
            success: false,
            error: {
              code: 'SERVICE_UNAVAILABLE',
              message: 'The upstream service did not respond in time.',
              statusCode: 502,
            },
            meta: { timestamp: new Date().toISOString(), requestId },
          }),
        );
      },
    },
  };
  const apiProxy = createProxyMiddleware(proxyOptions);

  // Only proxy paths that have a known target; everything else (health,
  // dashboard aggregation, Swagger) is served by the gateway itself.
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (resolveTarget(req.url ?? '')) {
      void apiProxy(req, res, next);
      return;
    }
    next();
  });

  if (process.env.NODE_ENV !== 'production' || process.env.SWAGGER_ENABLED === 'true') {
    const config = new DocumentBuilder()
      .setTitle('SHIFTLY API Gateway')
      .setDescription('Backend-For-Frontend: aggregation endpoints and downstream routing.')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config), {
      swaggerOptions: { persistAuthorization: true },
    });
    logger.log('Swagger UI mounted at /docs');
  }

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
  logger.log(`SHIFTLY API Gateway listening on port ${port} (${process.env.NODE_ENV})`);
}

void bootstrap().catch((error: unknown) => {
  // The Nest logger may not exist yet if bootstrap failed during module init.
  console.error('Failed to start API Gateway:', error);
  process.exit(1);
});
