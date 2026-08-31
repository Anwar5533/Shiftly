import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, env } from 'prisma/config';

// Prisma 7 no longer auto-loads `.env`, and `env()` reads only from `process.env`.
// Load the service-local `.env` first so CLI commands (`prisma generate`,
// `migrate`) work in local dev without exporting DATABASE_URL by hand. CI and
// containers set DATABASE_URL directly, so an already-set value always wins.
if (!process.env.DATABASE_URL) {
  const envPath = resolve(process.cwd(), '.env');
  if (existsSync(envPath)) {
    process.loadEnvFile(envPath);
  }
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
});
