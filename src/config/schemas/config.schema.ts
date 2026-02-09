import { z } from 'zod';

/**
 * Helper to create optional string that treats empty strings as undefined
 */
const optionalString = () =>
  z
    .string()
    .optional()
    .transform(val => (val === '' ? undefined : val));

/**
 * Helper to create optional URL that treats empty strings as undefined
 */
const optionalUrl = () =>
  z
    .string()
    .optional()
    .transform(val => (val === '' ? undefined : val))
    .refine(val => val === undefined || z.string().url().safeParse(val).success, {
      message: 'Invalid url',
    });

/**
 * Helper to create optional email that treats empty strings as undefined
 */
const optionalEmail = () =>
  z
    .string()
    .optional()
    .transform(val => (val === '' ? undefined : val))
    .refine(val => val === undefined || z.string().email().safeParse(val).success, {
      message: 'Invalid email',
    });

/**
 * Helper to create optional number from string that treats empty strings as undefined
 */
const optionalNumber = () =>
  z
    .string()
    .optional()
    .transform(val => {
      if (val === '' || val === undefined) return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    });

/**
 * Environment Configuration Schema
 *
 * Validates all environment variables at application startup.
 * This ensures the application fails fast if required
 * configuration is missing or invalid.
 */
export const configSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test', 'qa']).default('development'),
  APP_NAME: z.string().default('enterprise-backend'),
  APP_PORT: z.string().transform(Number).pipe(z.number().positive()).default('3000'),
  APP_HOST: z.string().default('localhost'),
  API_PREFIX: z.string().default('api'),
  API_VERSION: z.string().default('v1'),

  // Database
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().transform(Number).pipe(z.number().positive()).default('5432'),
  DB_USERNAME: z.string().default('postgres'),
  DB_PASSWORD: z.string().default(''),
  DB_DATABASE: z.string().default('enterprise_db'),
  DB_SYNCHRONIZE: z
    .string()
    .transform(val => val === 'true')
    .default('false'),
  DB_LOGGING: z
    .string()
    .transform(val => val === 'true')
    .default('true'),
  DB_SSL: z
    .string()
    .transform(val => val === 'true')
    .default('false'),

  // JWT
  JWT_SECRET: z.string().min(32).default('default-secret-key-that-must-be-changed-in-production'),
  JWT_EXPIRES_IN: z.string().default('1d'),
  JWT_REFRESH_SECRET: z.string().min(32).default('default-refresh-secret-key-change-in-production'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Redis (optional)
  REDIS_HOST: optionalString(),
  REDIS_PORT: optionalNumber(),
  REDIS_PASSWORD: optionalString(),

  // RabbitMQ (optional)
  RABBITMQ_URL: optionalUrl(),
  RABBITMQ_QUEUE_PREFIX: optionalString(),

  // Email (optional)
  SMTP_HOST: optionalString(),
  SMTP_PORT: optionalNumber(),
  SMTP_SECURE: optionalString(),
  SMTP_USER: optionalEmail(),
  SMTP_PASSWORD: optionalString(),
  SENDGRID_API_KEY: optionalString(),
  EMAIL_FROM: optionalEmail(),
  EMAIL_FROM_NAME: optionalString(),

  // Azure Search (optional)
  AZURE_SEARCH_ENDPOINT: optionalUrl(),
  AZURE_SEARCH_API_KEY: optionalString(),
  AZURE_SEARCH_INDEX_NAME: optionalString(),

  // AI (optional)
  AI_PROVIDER: z.enum(['openai', 'azure']).optional(),
  OPENAI_API_KEY: optionalString(),
  OPENAI_MODEL: optionalString(),
  OPENAI_MAX_TOKENS: optionalNumber(),
  AZURE_OPENAI_ENDPOINT: optionalUrl(),
  AZURE_OPENAI_API_KEY: optionalString(),
  AZURE_OPENAI_DEPLOYMENT_NAME: optionalString(),
  AZURE_OPENAI_API_VERSION: optionalString(),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug', 'verbose']).default('info'),
  LOG_FORMAT: z.enum(['json', 'pretty']).default('json'),

  // Rate Limiting
  THROTTLE_TTL: z.string().transform(Number).default('60'),
  THROTTLE_LIMIT: z.string().transform(Number).default('100'),

  // CORS
  CORS_ORIGINS: optionalString(),
});

export type ConfigType = z.infer<typeof configSchema>;

/**
 * Validate configuration at startup
 */
export function validateConfig(config: Record<string, unknown>): ConfigType {
  const result = configSchema.safeParse(config);

  if (!result.success) {
    const errors = result.error.errors
      .map(err => `  - ${err.path.join('.')}: ${err.message}`)
      .join('\n');

    throw new Error(`Configuration validation failed:\n${errors}`);
  }

  return result.data;
}
