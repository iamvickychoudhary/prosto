import { Global, Module } from '@nestjs/common';
import { WinstonLoggerService } from './logging/winston-logger.service';

/**
 * Core Module
 *
 * Contains global application infrastructure:
 * - Logging service
 * - Exception filters
 * - Interceptors
 * - Guards
 * - Pipes
 *
 * This module is marked as @Global so its exports
 * are available throughout the application.
 */
@Global()
@Module({
  providers: [WinstonLoggerService],
  exports: [WinstonLoggerService],
})
export class CoreModule {}
