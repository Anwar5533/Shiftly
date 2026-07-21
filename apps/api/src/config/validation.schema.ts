import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'staging', 'production')
    .required(),
  PORT: Joi.number().default(3001),
  DATABASE_URL: Joi.string().uri().required(),
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().optional().allow(''),
  REDIS_TLS: Joi.string().valid('true', 'false').default('false'),
  KAFKA_BROKERS: Joi.string().required(),
  KAFKA_CLIENT_ID: Joi.string().default('shiftly-api'),
  KAFKA_GROUP_ID: Joi.string().default('shiftly-consumer-group'),
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  AWS_REGION: Joi.string().default('ap-south-1'),
  AWS_ACCESS_KEY_ID: Joi.string().optional().allow(''),
  AWS_SECRET_ACCESS_KEY: Joi.string().optional().allow(''),
  AWS_S3_BUCKET: Joi.string().required(),
  AWS_SES_FROM_EMAIL: Joi.string().email().required(),
  OPENSEARCH_ENDPOINT: Joi.string().uri().required(),
  OPENAI_API_KEY: Joi.string().required(),
  CORS_ORIGINS: Joi.string().default('http://localhost:5173'),
  PLATFORM_FEE_PERCENT: Joi.number().min(0).max(100).default(10),
  OTLP_ENDPOINT: Joi.string().uri().optional(),
  OTLP_SERVICE_NAME: Joi.string().default('shiftly-api'),
  OTP_EXPIRE_SECONDS: Joi.number().default(300),
  OTP_MAX_ATTEMPTS: Joi.number().default(5),
}).unknown(true);
