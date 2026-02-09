import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Request ID Middleware
 *
 * Assigns a unique identifier to each incoming request for:
 * - Request tracing across services
 * - Log correlation
 * - Debugging and monitoring
 *
 * The request ID is:
 * - Generated if not provided
 * - Preserved if provided in X-Request-ID header
 * - Added to response headers
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const requestId = (req.headers['x-request-id'] as string) || uuidv4();

    // Attach to request for use in handlers
    req.headers['x-request-id'] = requestId;

    // Include in response headers for client correlation
    res.setHeader('X-Request-ID', requestId);

    next();
  }
}
