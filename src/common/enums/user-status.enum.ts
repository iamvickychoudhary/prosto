/**
 * User Status Enum
 */
export enum UserStatus {
  /** Active and can access the system */
  ACTIVE = 'active',

  /** Inactive, cannot login */
  INACTIVE = 'inactive',

  /** Pending email verification */
  PENDING = 'pending',

  /** Account suspended by admin */
  SUSPENDED = 'suspended',

  /** Account deleted */
  DELETED = 'deleted',
}
