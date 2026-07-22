/* eslint-disable prettier/prettier -- TODO(RC3): Address type safety */
import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

const { combine, timestamp, json, colorize, printf, errors } = winston.format;

const developmentFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ timestamp: ts, level, message, context, trace, ...meta }) => {
// eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions -- TODO(RC3): Address type safety
    const ctx = context ? `[${context}]` : '';
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
// eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions -- TODO(RC3): Address type safety
    const traceStr = trace ? `\n${trace}` : '';
// eslint-disable-next-line @typescript-eslint/restrict-template-expressions -- TODO(RC3): Address type safety
    return `${ts} ${level} ${ctx} ${message}${metaStr}${traceStr}`;
  }),
);

const productionFormat = combine(timestamp(), errors({ stack: true }), json());

export function createWinstonConfig(): WinstonModuleOptions {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    level: isProduction ? 'info' : 'debug',
    format: isProduction ? productionFormat : developmentFormat,
    defaultMeta: {
      service: 'shiftly-api',
      version: process.env.npm_package_version,
      environment: process.env.NODE_ENV,
    },
    transports: [
      new winston.transports.Console(),
      ...(isProduction
        ? [
            new winston.transports.File({
              filename: 'logs/error.log',
              level: 'error',
              maxsize: 10 * 1024 * 1024,
              maxFiles: 5,
            }),
            new winston.transports.File({
              filename: 'logs/combined.log',
              maxsize: 10 * 1024 * 1024,
              maxFiles: 10,
            }),
          ]
        : []),
    ],
    exceptionHandlers: [new winston.transports.Console()],
    rejectionHandlers: [new winston.transports.Console()],
  };
}
