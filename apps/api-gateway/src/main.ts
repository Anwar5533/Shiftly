import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as compression from 'compression';
import { Request, Response, NextFunction } from 'express';

import { createProxyMiddleware } from 'http-proxy-middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  app.use(helmet());
  app.use(compression());

  const port = process.env.PORT || 3000;

  app.enableCors({ origin: 'http://localhost:5173', credentials: true });

  app.setGlobalPrefix('api/v1');

  // Global Proxy Router
  const apiProxy = createProxyMiddleware({
    changeOrigin: true,
    router: (req: Request) => {
      const url = req.url || '';
      if (url.startsWith('/api/v1/auth'))
        return process.env.IDENTITY_URL || 'http://localhost:3003';
      if (
        url.startsWith('/api/v1/workers') ||
        url.startsWith('/api/v1/employers') ||
        url.startsWith('/api/v1/recruiters') ||
        url.startsWith('/api/v1/kyc')
      )
        return process.env.USER_URL || 'http://localhost:3004';
      if (
        url.startsWith('/api/v1/jobs') ||
        url.startsWith('/api/v1/shifts') ||
        url.startsWith('/api/v1/timesheets')
      )
        return process.env.JOBS_URL || 'http://localhost:3005';
      if (url.startsWith('/api/v1/applications'))
        return process.env.APPLICATIONS_URL || 'http://localhost:3006';
      if (url.startsWith('/api/v1/analytics'))
        return process.env.ANALYTICS_URL || 'http://localhost:3007';
      if (url.startsWith('/api/v1/search'))
        return process.env.SEARCH_URL || 'http://localhost:3008';
      if (
        url.startsWith('/api/v1/payments') ||
        url.startsWith('/api/v1/webhooks/payments') ||
        url.startsWith('/api/v1/escrow') ||
        url.startsWith('/api/v1/wallets')
      )
        return process.env.PAYMENTS_URL || 'http://localhost:3009';
      if (url.startsWith('/api/v1/documents'))
        return process.env.DOCUMENTS_URL || 'http://localhost:3010';
      if (url.startsWith('/api/v1/notifications'))
        return process.env.NOTIFICATIONS_URL || 'http://localhost:3011';

      // Fallback to monolith
      return process.env.MONOLITH_URL || 'http://localhost:3002';
    },
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    const url = req.url || '';
    const proxiedPrefixes = [
      '/api/v1/auth',
      '/api/v1/workers',
      '/api/v1/employers',
      '/api/v1/recruiters',
      '/api/v1/kyc',
      '/api/v1/jobs',
      '/api/v1/shifts',
      '/api/v1/timesheets',
      '/api/v1/applications',
      '/api/v1/analytics',
      '/api/v1/search',
      '/api/v1/payments',
      '/api/v1/webhooks/payments',
      '/api/v1/escrow',
      '/api/v1/wallets',
      '/api/v1/documents',
      '/api/v1/notifications',
    ];

    if (proxiedPrefixes.some((p) => url.startsWith(p))) {
      apiProxy(req, res, next);
    } else {
      next();
    }
  });

  await app.listen(port);
  console.log(`🚀 SHIFTLY API Gateway running on http://localhost:${port}`);
}
bootstrap().catch((err) => {
  console.error('Failed to start API Gateway:', err);
  process.exit(1);
});
