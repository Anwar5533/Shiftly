/**
 * Minimal smoke test for AppModule.
 *
 * ConfigModule.forRoot() validates required env vars at import time,
 * so we populate the minimum set before the import is evaluated.
 */

// Provide the required env vars before the module is loaded
process.env.IDENTITY_URL = 'http://localhost:3001';
process.env.USER_URL = 'http://localhost:3002';
process.env.JOBS_URL = 'http://localhost:3003';
process.env.APPLICATIONS_URL = 'http://localhost:3004';
process.env.ANALYTICS_URL = 'http://localhost:3005';
process.env.SEARCH_URL = 'http://localhost:3006';
process.env.PAYMENTS_URL = 'http://localhost:3007';
process.env.DOCUMENTS_URL = 'http://localhost:3008';
process.env.NOTIFICATIONS_URL = 'http://localhost:3009';
process.env.JWT_ACCESS_SECRET = 'test-jwt-secret-must-be-at-least-32-chars-long';

import { AppModule } from './app.module';

describe('AppModule', () => {
  it('should be defined', () => {
    expect(AppModule).toBeDefined();
  });
});
