import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as compression from 'compression';

import { createProxyMiddleware } from 'http-proxy-middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  app.use(helmet());
  app.use(compression());

  const port = process.env.GATEWAY_PORT || 3001;

  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
    credentials: true,
  });

  // Global Proxy Router
  app.use(
    createProxyMiddleware({
      changeOrigin: true,
      router: (req) => {
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
    }),
  );

  await app.listen(port);
  console.log(`🚀 SHIFTLY API Gateway running on http://localhost:${port}`);
}
bootstrap().catch((err) => {
  console.error('Failed to start API Gateway:', err);
  process.exit(1);
});
