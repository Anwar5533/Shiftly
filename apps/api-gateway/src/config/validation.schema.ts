import * as Joi from 'joi';

/**
 * The gateway is a Backend-For-Frontend: it holds no database, so its config is
 * limited to where the downstreams live, how to verify a JWT, and how long it
 * will wait before it degrades a response.
 *
 * Every `*_URL` is `required()` on purpose — a gateway that boots without
 * knowing where `identity-service` lives would answer probes as healthy and
 * then 500 on the first real request. Failing at bootstrap turns that into a
 * CrashLoopBackOff the deploy pipeline can actually see.
 */
export const gatewayEnvSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'staging', 'production')
    .default('development'),
  PORT: Joi.number().port().default(3000),

  // ── Downstream service base URLs (no trailing slash) ──────────────────────
  IDENTITY_URL: Joi.string().uri().required(),
  USER_URL: Joi.string().uri().required(),
  JOBS_URL: Joi.string().uri().required(),
  APPLICATIONS_URL: Joi.string().uri().required(),
  ANALYTICS_URL: Joi.string().uri().required(),
  SEARCH_URL: Joi.string().uri().required(),
  PAYMENTS_URL: Joi.string().uri().required(),
  DOCUMENTS_URL: Joi.string().uri().required(),
  NOTIFICATIONS_URL: Joi.string().uri().required(),

  // ── Auth ──────────────────────────────────────────────────────────────────
  // Verify-only: the gateway never signs tokens, so the refresh secret is not
  // needed here. 32 bytes is the floor for HS256 to be worth anything.
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),

  // ── Redis (shared rate-limit counters across gateway replicas) ────────────
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().port().default(6379),
  REDIS_PASSWORD: Joi.string().optional().allow(''),
  REDIS_DB: Joi.number().min(0).default(0),
  REDIS_TLS: Joi.string().valid('true', 'false').default('false'),

  // ── Rate limiting ─────────────────────────────────────────────────────────
  THROTTLE_TTL_MS: Joi.number().min(1000).default(60_000),
  THROTTLE_LIMIT: Joi.number().min(1).default(100),

  // ── Timeouts ──────────────────────────────────────────────────────────────
  // Must stay below the ingress/ALB read timeout, otherwise the proxy returns
  // 504 before the gateway gets the chance to degrade gracefully.
  DOWNSTREAM_TIMEOUT_MS: Joi.number().min(100).max(30_000).default(5_000),
  HEALTH_PROBE_TIMEOUT_MS: Joi.number().min(100).max(10_000).default(2_000),

  // ── Misc ──────────────────────────────────────────────────────────────────
  CORS_ORIGINS: Joi.string().default('http://localhost:5173'),
  OTLP_ENDPOINT: Joi.string().uri().optional().allow(''),
  OTLP_SERVICE_NAME: Joi.string().default('shiftly-api-gateway'),
  SWAGGER_ENABLED: Joi.string().valid('true', 'false').default('false'),
}).unknown(true);
