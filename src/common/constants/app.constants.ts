/**
 * Application Constants
 */

export const APP_CONSTANTS = {
  /** Default pagination limit */
  DEFAULT_PAGE_SIZE: 10,

  /** Maximum pagination limit */
  MAX_PAGE_SIZE: 100,

  /** Default token expiration (in seconds) */
  DEFAULT_TOKEN_EXPIRY: 86400, // 24 hours

  /** Refresh token expiration (in seconds) */
  REFRESH_TOKEN_EXPIRY: 604800, // 7 days

  /** Password minimum length */
  MIN_PASSWORD_LENGTH: 8,

  /** Maximum login attempts before lockout */
  MAX_LOGIN_ATTEMPTS: 5,

  /** Account lockout duration (in minutes) */
  LOCKOUT_DURATION: 30,

  /** Email verification token expiry (in hours) */
  EMAIL_VERIFICATION_EXPIRY: 24,

  /** Password reset token expiry (in hours) */
  PASSWORD_RESET_EXPIRY: 1,
} as const;

/**
 * HTTP Status Messages
 */
export const HTTP_MESSAGES = {
  SUCCESS: 'Operation completed successfully',
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  NOT_FOUND: 'Resource not found',
  BAD_REQUEST: 'Invalid request',
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Access denied',
  CONFLICT: 'Resource already exists',
  INTERNAL_ERROR: 'Internal server error',
} as const;

/**
 * Queue Names
 */
export const QUEUE_NAMES = {
  EMAIL: 'email-queue',
  NOTIFICATION: 'notification-queue',
  AI_PROCESSING: 'ai-processing-queue',
  SEARCH_INDEXING: 'search-indexing-queue',
  BACKGROUND_JOBS: 'background-jobs-queue',
} as const;

/**
 * Cache Keys
 */
export const CACHE_KEYS = {
  USER_PREFIX: 'user:',
  SESSION_PREFIX: 'session:',
  CONFIG_PREFIX: 'config:',
  RATE_LIMIT_PREFIX: 'rate:',
} as const;

/**
 * Cache TTL (in seconds)
 */
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const;
