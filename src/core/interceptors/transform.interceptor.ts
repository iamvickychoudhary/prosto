import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';

/**
 * Standard API Response Interface
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    timestamp: string;
    path: string;
    version: string;
    requestId?: string;
  };
}

/**
 * Response with message (for controllers to use)
 */
export interface ResponseWithMessage<T> {
  data: T;
  message: string;
}

/**
 * Helper to create a response with message
 */
export function withMessage<T>(data: T, message: string): ResponseWithMessage<T> {
  return { data, message };
}

/**
 * Transform Interceptor
 *
 * Transforms all successful responses into a standardized format.
 * This ensures consistent API responses across all endpoints.
 *
 * Response format:
 * {
 *   success: true,
 *   data: <response data>,
 *   message?: string,
 *   meta: {
 *     timestamp: string,
 *     path: string,
 *     version: string,
 *     requestId?: string
 *   }
 * }
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const requestId = request.headers['x-request-id'] as string;

    return next.handle().pipe(
      map((responseData: T | ResponseWithMessage<T>) => {
        // Check if response has message wrapper
        const hasMessageWrapper =
          responseData &&
          typeof responseData === 'object' &&
          'data' in responseData &&
          'message' in responseData;

        const data = hasMessageWrapper
          ? (responseData as ResponseWithMessage<T>).data
          : responseData;
        const message = hasMessageWrapper
          ? (responseData as ResponseWithMessage<T>).message
          : undefined;

        return {
          success: true,
          data,
          ...(message && { message }),
          meta: {
            timestamp: new Date().toISOString(),
            path: request.url,
            version: process.env.API_VERSION || 'v1',
            requestId,
          },
        };
      }),
    );
  }
}
