import { registerAs } from '@nestjs/config';

/**
 * Application Configuration
 */
export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  name: process.env.APP_NAME || 'enterprise-backend',
  port: parseInt(process.env.APP_PORT || '3000', 10),
  host: process.env.APP_HOST || 'localhost',
  apiPrefix: process.env.API_PREFIX || 'api',
  apiVersion: process.env.API_VERSION || 'v1',
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
}));

/**
 * Database Configuration
 */
export const databaseConfig = registerAs('database', () => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'enterprise_db',
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
  ssl: process.env.DB_SSL === 'true',
}));

/**
 * Authentication Configuration
 */
export const authConfig = registerAs('auth', () => ({
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
}));

/**
 * Redis Configuration
 */
export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
}));

/**
 * RabbitMQ Configuration
 */
export const rabbitMQConfig = registerAs('rabbitmq', () => ({
  url: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
  queuePrefix: process.env.RABBITMQ_QUEUE_PREFIX || 'enterprise',
}));

/**
 * Email Configuration
 */
export const emailConfig = registerAs('email', () => ({
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
  },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
  },
  from: process.env.EMAIL_FROM || 'noreply@example.com',
  fromName: process.env.EMAIL_FROM_NAME || 'Enterprise App',
}));

/**
 * Azure Configuration
 */
export const azureConfig = registerAs('azure', () => ({
  search: {
    endpoint: process.env.AZURE_SEARCH_ENDPOINT,
    apiKey: process.env.AZURE_SEARCH_API_KEY,
    indexName: process.env.AZURE_SEARCH_INDEX_NAME,
  },
  openai: {
    endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    apiKey: process.env.AZURE_OPENAI_API_KEY,
    deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
    apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview',
  },
}));

/**
 * AI Configuration
 */
export const aiConfig = registerAs('ai', () => ({
  provider: process.env.AI_PROVIDER || 'openai', // 'openai' | 'azure'
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '4096', 10),
  },
}));
