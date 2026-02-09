import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Base Business Exception
 *
 * Custom exception for business logic errors.
 * Provides standardized error codes and messages
 * for domain-specific errors.
 */
export class BusinessException extends HttpException {
  constructor(
    public readonly errorCode: string,
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(
      {
        statusCode: status,
        errorCode,
        message,
        timestamp: new Date().toISOString(),
      },
      status,
    );
  }
}

/**
 * Entity Not Found Exception
 */
export class EntityNotFoundException extends BusinessException {
  constructor(entityName: string, identifier?: string | number) {
    const message = identifier
      ? `${entityName} with identifier '${identifier}' not found`
      : `${entityName} not found`;
    super('ENTITY_NOT_FOUND', message, HttpStatus.NOT_FOUND);
  }
}

/**
 * Entity Already Exists Exception
 */
export class EntityAlreadyExistsException extends BusinessException {
  constructor(entityName: string, field?: string) {
    const message = field
      ? `${entityName} with this ${field} already exists`
      : `${entityName} already exists`;
    super('ENTITY_ALREADY_EXISTS', message, HttpStatus.CONFLICT);
  }
}

/**
 * Invalid Operation Exception
 */
export class InvalidOperationException extends BusinessException {
  constructor(message: string) {
    super('INVALID_OPERATION', message, HttpStatus.BAD_REQUEST);
  }
}

/**
 * Unauthorized Access Exception
 */
export class UnauthorizedAccessException extends BusinessException {
  constructor(message = 'Unauthorized access') {
    super('UNAUTHORIZED_ACCESS', message, HttpStatus.FORBIDDEN);
  }
}

/**
 * External Service Exception
 */
export class ExternalServiceException extends BusinessException {
  constructor(serviceName: string, message?: string) {
    super(
      'EXTERNAL_SERVICE_ERROR',
      message || `Error communicating with ${serviceName}`,
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}

/**
 * Rate Limit Exception
 */
export class RateLimitException extends BusinessException {
  constructor(message = 'Rate limit exceeded') {
    super('RATE_LIMIT_EXCEEDED', message, HttpStatus.TOO_MANY_REQUESTS);
  }
}

/**
 * Validation Exception with field-level errors
 */
export class ValidationException extends BusinessException {
  constructor(public readonly errors: Array<{ field: string; message: string }>) {
    super('VALIDATION_ERROR', 'Validation failed', HttpStatus.UNPROCESSABLE_ENTITY);
  }

  getResponse(): object {
    const baseResponse = super.getResponse();
    return {
      ...(typeof baseResponse === 'object' && baseResponse !== null ? baseResponse : {}),
      errors: this.errors,
    };
  }
}
