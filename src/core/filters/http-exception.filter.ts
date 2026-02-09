import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { WinstonLoggerService } from '../logging/winston-logger.service';

/**
 * HTTP Exception Response Interface
 */
interface HttpExceptionResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
  timestamp: string;
  path: string;
  method: string;
  requestId?: string;
}

/**
 * Global HTTP Exception Filter
 *
 * Catches all HTTP exceptions and formats them consistently.
 * Provides:
 * - Standardized error response format
 * - Request context in errors
 * - Logging of all exceptions
 * - Stack traces in development
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: WinstonLoggerService) {
    this.logger.setContext('HttpExceptionFilter');
  }

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorResponse: HttpExceptionResponse = {
      statusCode: status,
      message: this.extractMessage(exceptionResponse),
      error: exception.name,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      requestId: request.headers['x-request-id'] as string,
    };

    // Log the exception
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${JSON.stringify(errorResponse.message)}`,
      exception.stack,
    );

    response.status(status).json(errorResponse);
  }

  private extractMessage(exceptionResponse: string | object): string | string[] {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
      return (exceptionResponse as { message: string | string[] }).message;
    }

    return 'Internal server error';
  }
}

/**
 * All Exceptions Filter
 *
 * Catches all unhandled exceptions including non-HTTP exceptions.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: WinstonLoggerService) {
    this.logger.setContext('AllExceptionsFilter');
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException ? exception.message : 'Internal server error';

    const errorResponse: HttpExceptionResponse = {
      statusCode: status,
      message,
      error: exception instanceof Error ? exception.name : 'Error',
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      requestId: request.headers['x-request-id'] as string,
    };

    // Log the exception with stack trace
    const stack = exception instanceof Error ? exception.stack : undefined;
    this.logger.error(`Unhandled exception: ${request.method} ${request.url}`, stack);

    response.status(status).json(errorResponse);
  }
}
