import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3001', 10),
  apiVersion: process.env.API_VERSION ?? 'v1',
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:5173').split(','),
  platformFeePercent: parseFloat(process.env.PLATFORM_FEE_PERCENT ?? '10'),
  otpExpireSeconds: parseInt(process.env.OTP_EXPIRE_SECONDS ?? '300', 10),
  otpMaxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS ?? '5', 10),
}));
