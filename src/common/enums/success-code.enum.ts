/**
 * Success Code Enum
 *
 * Centralized success codes for API responses.
 * Use these codes consistently across all services.
 */
export enum SuccessCode {
  // ============================================
  // Authentication Success
  // ============================================
  /** OTP sent successfully */
  OTP_SENT = 'OTP_SENT',

  /** OTP verified successfully */
  OTP_VERIFIED = 'OTP_VERIFIED',

  /** Login successful */
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',

  /** Logout successful */
  LOGOUT_SUCCESS = 'LOGOUT_SUCCESS',

  /** Token refreshed successfully */
  TOKEN_REFRESHED = 'TOKEN_REFRESHED',

  // ============================================
  // Registration Success
  // ============================================
  /** Draft created successfully */
  DRAFT_CREATED = 'DRAFT_CREATED',

  /** Profile updated successfully */
  PROFILE_UPDATED = 'PROFILE_UPDATED',

  /** Profile completed successfully */
  PROFILE_COMPLETED = 'PROFILE_COMPLETED',

  /** Account created successfully */
  ACCOUNT_CREATED = 'ACCOUNT_CREATED',

  // ============================================
  // Photo Success
  // ============================================
  /** Photo uploaded successfully */
  PHOTO_UPLOADED = 'PHOTO_UPLOADED',

  /** Photo deleted successfully */
  PHOTO_DELETED = 'PHOTO_DELETED',

  // ============================================
  // General Success
  // ============================================
  /** Operation successful */
  SUCCESS = 'SUCCESS',

  /** Created successfully */
  CREATED = 'CREATED',

  /** Updated successfully */
  UPDATED = 'UPDATED',

  /** Deleted successfully */
  DELETED = 'DELETED',
}
