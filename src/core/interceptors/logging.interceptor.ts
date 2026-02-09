import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { WinstonLoggerService } from '../logging/winston-logger.service';

/**
 * Logging Interceptor
 *
 * Logs all incoming requests and outgoing responses with:
 * - Request method and URL
 * - Response status code
 * - Request duration
 * - Request ID for tracing
 * - User information (if authenticated)
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: WinstonLoggerService) {
    this.logger.setContext('HTTP');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, body } = request;
    const requestId = request.headers['x-request-id'] as string;
    const userAgent = request.get('user-agent') || '';
    const ip = request.ip;

    const startTime = Date.now();

    // Log incoming request
    this.logger.log(`➡️  ${method} ${url} - ${ip} - ${userAgent.substring(0, 50)}`);

    // Log request body in debug mode (sanitize sensitive data)
    if (process.env.LOG_LEVEL === 'debug' && body && Object.keys(body).length) {
      const sanitizedBody = this.sanitizeBody(body);
      this.logger.debug(`Request body: ${JSON.stringify(sanitizedBody)}`);
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          this.logger.log(
            `⬅️  ${method} ${url} - ${response.statusCode} - ${duration}ms [${requestId}]`,
          );
        },
        error: (error: Error) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `❌ ${method} ${url} - ${duration}ms - ${error.message} [${requestId}]`,
          );
        },
      }),
    );
  }

  /**
   * Sanitize sensitive fields from request body for logging
   */
  private sanitizeBody(body: Record<string, unknown>): Record<string, unknown> {
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard'];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}
