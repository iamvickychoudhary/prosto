import { Injectable, LoggerService, Scope } from '@nestjs/common';
import * as winston from 'winston';

/**
 * Winston Logger Service
 *
 * Production-ready logging service with:
 * - Multiple transport support (console, file)
 * - JSON format for production
 * - Pretty print for development
 * - Log levels based on environment
 * - Request context support
 */
@Injectable({ scope: Scope.TRANSIENT })
export class WinstonLoggerService implements LoggerService {
  private logger: winston.Logger;
  private context?: string;

  constructor() {
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const logLevel = process.env.LOG_LEVEL || 'info';

    const formats = [
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
    ];

    if (isDevelopment) {
      formats.push(
        winston.format.colorize({ all: true }),
        winston.format.printf(({ timestamp, level, message, context, trace, ...meta }) => {
          const contextStr = context ? `[${context}]` : '';
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
          const traceStr = trace ? `\n${trace}` : '';
          return `${timestamp} ${level} ${contextStr} ${message} ${metaStr}${traceStr}`;
        }),
      );
    } else {
      formats.push(winston.format.json());
    }

    // Build logger options
    const loggerOptions: winston.LoggerOptions = {
      level: logLevel,
      format: winston.format.combine(...formats),
      transports: [new winston.transports.Console()],
      // Disable exitOnError in development to avoid winston warnings
      exitOnError: !isDevelopment,
    };

    // Add file transports and handlers only in production
    if (!isDevelopment) {
      loggerOptions.transports = [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
        }),
      ];
      loggerOptions.exceptionHandlers = [
        new winston.transports.File({ filename: 'logs/exceptions.log' }),
      ];
      loggerOptions.rejectionHandlers = [
        new winston.transports.File({ filename: 'logs/rejections.log' }),
      ];
    }

    this.logger = winston.createLogger(loggerOptions);
  }

  setContext(context: string): void {
    this.context = context;
  }

  log(message: string, context?: string): void {
    this.logger.info(message, { context: context || this.context });
  }

  error(message: string, trace?: string, context?: string): void {
    this.logger.error(message, { trace, context: context || this.context });
  }

  warn(message: string, context?: string): void {
    this.logger.warn(message, { context: context || this.context });
  }

  debug(message: string, context?: string): void {
    this.logger.debug(message, { context: context || this.context });
  }

  verbose(message: string, context?: string): void {
    this.logger.verbose(message, { context: context || this.context });
  }

  /**
   * Log with additional metadata
   */
  logWithMeta(level: string, message: string, meta: Record<string, unknown>): void {
    this.logger.log(level, message, { ...meta, context: this.context });
  }
}
