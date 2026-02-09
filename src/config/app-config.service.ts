import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Application Configuration Service
 *
 * Provides typed access to all configuration values.
 * This service abstracts the ConfigService and provides
 * type-safe getters for all configuration options.
 */
@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) { }

  // ============================================
  // Application Configuration
  // ============================================

  get nodeEnv(): string {
    return this.configService.get<string>('app.nodeEnv', 'development');
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }

  get appName(): string {
    return this.configService.get<string>('app.name', 'enterprise-backend');
  }

  get port(): number {
    return this.configService.get<number>('app.port', 3000);
  }

  get host(): string {
    return this.configService.get<string>('app.host', 'localhost');
  }

  get apiPrefix(): string {
    return this.configService.get<string>('app.apiPrefix', 'api');
  }

  get apiVersion(): string {
    return this.configService.get<string>('app.apiVersion', 'v1');
  }

  get corsOrigins(): string[] {
    return this.configService.get<string[]>('app.corsOrigins', ['*']);
  }

  // ============================================
  // Database Configuration
  // ============================================

  get databaseConfig() {
    return {
      host: this.configService.get<string>('database.host', 'localhost'),
      port: this.configService.get<number>('database.port', 5432),
      username: this.configService.get<string>('database.username', 'postgres'),
      password: this.configService.get<string>('database.password', ''),
      database: this.configService.get<string>('database.database', 'enterprise_db'),
      synchronize: this.configService.get<boolean>('database.synchronize', false),
      logging: this.configService.get<boolean>('database.logging', false),
      ssl: this.configService.get<boolean>('database.ssl', false),
    };
  }

  // ============================================
  // Authentication Configuration
  // ============================================

  get jwtSecret(): string {
    return this.configService.getOrThrow<string>('auth.jwtSecret');
  }

  get jwtExpiresIn(): string {
    return this.configService.get<string>('auth.jwtExpiresIn', '1d');
  }

  get jwtRefreshSecret(): string {
    return this.configService.getOrThrow<string>('auth.jwtRefreshSecret');
  }

  get jwtRefreshExpiresIn(): string {
    return this.configService.get<string>('auth.jwtRefreshExpiresIn', '7d');
  }

  // ============================================
  // Redis Configuration
  // ============================================

  get redisConfig() {
    return {
      host: this.configService.get<string>('redis.host', 'localhost'),
      port: this.configService.get<number>('redis.port', 6379),
      password: this.configService.get<string>('redis.password'),
    };
  }

  // ============================================
  // RabbitMQ Configuration
  // ============================================

  get rabbitMQConfig() {
    return {
      url: this.configService.get<string>('rabbitmq.url', 'amqp://guest:guest@localhost:5672'),
      queuePrefix: this.configService.get<string>('rabbitmq.queuePrefix', 'enterprise'),
    };
  }

  // ============================================
  // Email Configuration
  // ============================================

  get emailConfig() {
    return {
      smtp: {
        host: this.configService.get<string>('email.smtp.host'),
        port: this.configService.get<number>('email.smtp.port', 587),
        secure: this.configService.get<boolean>('email.smtp.secure', false),
        user: this.configService.get<string>('email.smtp.user'),
        password: this.configService.get<string>('email.smtp.password'),
      },
      sendgrid: {
        apiKey: this.configService.get<string>('email.sendgrid.apiKey'),
      },
      from: this.configService.get<string>('email.from', 'noreply@example.com'),
      fromName: this.configService.get<string>('email.fromName', 'Enterprise App'),
    };
  }

  // ============================================
  // Azure Configuration
  // ============================================

  get azureSearchConfig() {
    return {
      endpoint: this.configService.get<string>('azure.search.endpoint'),
      apiKey: this.configService.get<string>('azure.search.apiKey'),
      indexName: this.configService.get<string>('azure.search.indexName'),
    };
  }

  get azureOpenAIConfig() {
    return {
      endpoint: this.configService.get<string>('azure.openai.endpoint'),
      apiKey: this.configService.get<string>('azure.openai.apiKey'),
      deploymentName: this.configService.get<string>('azure.openai.deploymentName'),
      apiVersion: this.configService.get<string>('azure.openai.apiVersion', '2024-02-15-preview'),
    };
  }

  // ============================================
  // AI Configuration
  // ============================================

  get aiProvider(): 'openai' | 'azure' {
    return this.configService.get<'openai' | 'azure'>('ai.provider', 'openai');
  }

  get openAIConfig() {
    return {
      apiKey: this.configService.get<string>('ai.openai.apiKey'),
      model: this.configService.get<string>('ai.openai.model', 'gpt-4-turbo-preview'),
      maxTokens: this.configService.get<number>('ai.openai.maxTokens', 4096),
    };
  }
}
