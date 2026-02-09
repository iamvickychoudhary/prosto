import { ErrorCode } from '../enums/error-code.enum';
import { SuccessCode } from '../enums/success-code.enum';

/**
 * API Response Messages
 *
 * Centralized messages for all API responses.
 * Organized by category for easy maintenance.
 */

// ============================================
// Error Messages
// ============================================
export const ErrorMessages: Record<ErrorCode, string> = {
  // Authentication Errors
  [ErrorCode.USER_NOT_FOUND]: 'No account found with this phone/email',
  [ErrorCode.INVALID_OTP]: 'Invalid OTP',
  [ErrorCode.OTP_EXPIRED]: 'OTP has expired. Please request a new one.',
  [ErrorCode.OTP_NOT_FOUND]: 'OTP not found. Please request a new one.',
  [ErrorCode.MAX_ATTEMPTS_EXCEEDED]: 'Maximum attempts exceeded. Please request a new OTP.',
  [ErrorCode.INVALID_CREDENTIALS]: 'Invalid email or password',
  [ErrorCode.TOKEN_EXPIRED]: 'Token has expired',
  [ErrorCode.INVALID_TOKEN]: 'Invalid token',

  // Account Status Errors
  [ErrorCode.ACCOUNT_SUSPENDED]: 'Your account has been suspended',
  [ErrorCode.ACCOUNT_INACTIVE]: 'Your account is inactive',
  [ErrorCode.ACCOUNT_DELETED]: 'No account found with this phone/email',

  // Registration Errors
  [ErrorCode.EMAIL_EXISTS]: 'An account with this email already exists',
  [ErrorCode.PHONE_EXISTS]: 'An account with this phone number already exists',
  [ErrorCode.INVALID_EMAIL]: 'Please enter a valid email address',
  [ErrorCode.INCOMPLETE_PROFILE]: 'Please complete all required fields',
  [ErrorCode.DRAFT_NOT_FOUND]: 'Draft profile not found',
  [ErrorCode.DRAFT_EXPIRED]: 'Draft profile has expired. Please start registration again.',

  // Validation Errors
  [ErrorCode.VALIDATION_ERROR]: 'Validation failed',
  [ErrorCode.AGE_RESTRICTION]: 'You must be at least 18 years old',
  [ErrorCode.INVALID_PHONE]: 'Please enter a valid phone number',
  [ErrorCode.INVALID_COUNTRY_CODE]: 'Please enter a valid country code',
  [ErrorCode.WEAK_PASSWORD]:
    'Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number',
  [ErrorCode.PASSWORD_MISMATCH]: 'Passwords do not match',

  // Photo Errors
  [ErrorCode.PHOTO_NOT_FOUND]: 'Photo not found',
  [ErrorCode.MAX_PHOTOS_EXCEEDED]: 'You can upload a maximum of 6 photos',
  [ErrorCode.MIN_PHOTOS_REQUIRED]: 'Please upload at least 2 photos',
  [ErrorCode.INVALID_FILE_TYPE]: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.',
  [ErrorCode.FILE_SIZE_EXCEEDED]: 'File size exceeds 5MB limit.',

  // General Errors
  [ErrorCode.ENTITY_NOT_FOUND]: 'Resource not found',
  [ErrorCode.ENTITY_ALREADY_EXISTS]: 'Resource already exists',
  [ErrorCode.UNAUTHORIZED]: 'Unauthorized access',
  [ErrorCode.FORBIDDEN]: 'Access forbidden',
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please try again later.',
  [ErrorCode.INTERNAL_ERROR]: 'An unexpected error occurred',
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: 'External service error',
};

// ============================================
// Success Messages
// ============================================
export const SuccessMessages: Record<SuccessCode, string> = {
  // Authentication Success
  [SuccessCode.OTP_SENT]: 'OTP sent successfully',
  [SuccessCode.OTP_VERIFIED]: 'OTP verified successfully',
  [SuccessCode.LOGIN_SUCCESS]: 'Login successful',
  [SuccessCode.LOGOUT_SUCCESS]: 'Logged out successfully',
  [SuccessCode.TOKEN_REFRESHED]: 'Token refreshed successfully',

  // Registration Success
  [SuccessCode.DRAFT_CREATED]: 'Draft created successfully',
  [SuccessCode.PROFILE_UPDATED]: 'Profile updated successfully',
  [SuccessCode.PROFILE_COMPLETED]: 'Profile completed successfully',
  [SuccessCode.ACCOUNT_CREATED]: 'Account created successfully',

  // Photo Success
  [SuccessCode.PHOTO_UPLOADED]: 'Photo uploaded successfully',
  [SuccessCode.PHOTO_DELETED]: 'Photo deleted successfully',

  // General Success
  [SuccessCode.SUCCESS]: 'Operation successful',
  [SuccessCode.CREATED]: 'Created successfully',
  [SuccessCode.UPDATED]: 'Updated successfully',
  [SuccessCode.DELETED]: 'Deleted successfully',
};

// ============================================
// Helper Functions
// ============================================

/**
 * Get error message by code
 */
export function getErrorMessage(code: ErrorCode): string {
  return ErrorMessages[code] || 'An unexpected error occurred';
}

/**
 * Get success message by code
 */
export function getSuccessMessage(code: SuccessCode): string {
  return SuccessMessages[code] || 'Operation successful';
}

/**
 * Create error response object
 */
export function createErrorResponse(code: ErrorCode, customMessage?: string) {
  return {
    code,
    message: customMessage || getErrorMessage(code),
  };
}

/**
 * Create success response with message
 */
export function createSuccessMessage(code: SuccessCode, customMessage?: string): string {
  return customMessage || getSuccessMessage(code);
}
