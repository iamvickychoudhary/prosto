import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfigService } from './app-config.service';
import {
  appConfig,
  databaseConfig,
  authConfig,
  redisConfig,
  rabbitMQConfig,
  emailConfig,
  azureConfig,
  aiConfig,
} from './configurations';
import { validateConfig } from './schemas/config.schema';

/**
 * Application Configuration Module
 *
 * Centralized configuration management with:
 * - Environment-based configuration
 * - Typed configuration objects
 * - Validation using Zod
 * - Configuration service abstraction
 */
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      load: [
        appConfig,
        databaseConfig,
        authConfig,
        redisConfig,
        rabbitMQConfig,
        emailConfig,
        azureConfig,
        aiConfig,
      ],
      validate: validateConfig,
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
