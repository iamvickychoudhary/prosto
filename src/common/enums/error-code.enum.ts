/**
 * Error Code Enum
 *
 * Centralized error codes for API responses.
 * Use these codes consistently across all services.
 */
export enum ErrorCode {
  // ============================================
  // Authentication Errors
  // ============================================
  /** User not found with provided credentials */
  USER_NOT_FOUND = 'USER_NOT_FOUND',

  /** Invalid OTP code provided */
  INVALID_OTP = 'INVALID_OTP',

  /** OTP has expired */
  OTP_EXPIRED = 'OTP_EXPIRED',

  /** OTP not found - request a new one */
  OTP_NOT_FOUND = 'OTP_NOT_FOUND',

  /** Maximum OTP verification attempts exceeded */
  MAX_ATTEMPTS_EXCEEDED = 'MAX_ATTEMPTS_EXCEEDED',

  /** Invalid credentials (email/password) */
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',

  /** Token has expired */
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',

  /** Invalid token */
  INVALID_TOKEN = 'INVALID_TOKEN',

  // ============================================
  // Account Status Errors
  // ============================================
  /** Account has been suspended by admin */
  ACCOUNT_SUSPENDED = 'ACCOUNT_SUSPENDED',

  /** Account is inactive */
  ACCOUNT_INACTIVE = 'ACCOUNT_INACTIVE',

  /** Account has been deleted */
  ACCOUNT_DELETED = 'ACCOUNT_DELETED',

  // ============================================
  // Registration Errors
  // ============================================
  /** Email already exists */
  EMAIL_EXISTS = 'EMAIL_EXISTS',

  /** Phone number already exists */
  PHONE_EXISTS = 'PHONE_EXISTS',

  /** Invalid email format */
  INVALID_EMAIL = 'INVALID_EMAIL',

  /** Profile is incomplete */
  INCOMPLETE_PROFILE = 'INCOMPLETE_PROFILE',

  /** Draft profile not found */
  DRAFT_NOT_FOUND = 'DRAFT_NOT_FOUND',

  /** Draft profile has expired */
  DRAFT_EXPIRED = 'DRAFT_EXPIRED',

  // ============================================
  // Validation Errors
  // ============================================
  /** General validation error */
  VALIDATION_ERROR = 'VALIDATION_ERROR',

  /** Age restriction - must be 18+ */
  AGE_RESTRICTION = 'AGE_RESTRICTION',

  /** Invalid phone number format */
  INVALID_PHONE = 'INVALID_PHONE',

  /** Invalid country code */
  INVALID_COUNTRY_CODE = 'INVALID_COUNTRY_CODE',

  /** Password requirements not met */
  WEAK_PASSWORD = 'WEAK_PASSWORD',

  /** Passwords do not match */
  PASSWORD_MISMATCH = 'PASSWORD_MISMATCH',

  // ============================================
  // Photo Errors
  // ============================================
  /** Photo not found */
  PHOTO_NOT_FOUND = 'PHOTO_NOT_FOUND',

  /** Maximum photos exceeded (6 max) */
  MAX_PHOTOS_EXCEEDED = 'MAX_PHOTOS_EXCEEDED',

  /** Minimum photos required (2 min) */
  MIN_PHOTOS_REQUIRED = 'MIN_PHOTOS_REQUIRED',

  /** Invalid file type */
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',

  /** File size exceeds limit */
  FILE_SIZE_EXCEEDED = 'FILE_SIZE_EXCEEDED',

  // ============================================
  // General Errors
  // ============================================
  /** Entity not found */
  ENTITY_NOT_FOUND = 'ENTITY_NOT_FOUND',

  /** Entity already exists */
  ENTITY_ALREADY_EXISTS = 'ENTITY_ALREADY_EXISTS',

  /** Unauthorized access */
  UNAUTHORIZED = 'UNAUTHORIZED',

  /** Forbidden access */
  FORBIDDEN = 'FORBIDDEN',

  /** Rate limit exceeded */
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  /** Internal server error */
  INTERNAL_ERROR = 'INTERNAL_ERROR',

  /** External service error */
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
}
