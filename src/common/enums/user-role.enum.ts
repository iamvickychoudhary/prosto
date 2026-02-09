/**
 * User Role Enum
 *
 * Defines available user roles in the system.
 */
export enum UserRole {
  /** Super administrator with full system access */
  SUPER_ADMIN = 'super_admin',

  /** Administrator with management capabilities */
  ADMIN = 'admin',

  /** Manager with limited admin access */
  MANAGER = 'manager',

  /** Regular user */
  USER = 'user',

  /** Guest user with read-only access */
  GUEST = 'guest',
}

/**
 * Role hierarchy for permission checks
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.SUPER_ADMIN]: 100,
  [UserRole.ADMIN]: 80,
  [UserRole.MANAGER]: 60,
  [UserRole.USER]: 40,
  [UserRole.GUEST]: 20,
};

/**
 * Check if role has higher or equal privilege
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
