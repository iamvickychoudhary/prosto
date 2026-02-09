import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@common/enums/user-role.enum';

export const ROLES_KEY = 'roles';

/**
 * Roles Decorator
 *
 * Specifies required roles to access a route.
 * Use with RolesGuard.
 *
 * Usage:
 * @Roles(UserRole.ADMIN)
 * @Get('admin/dashboard')
 * async adminDashboard() { ... }
 *
 * // Multiple roles (OR logic)
 * @Roles(UserRole.ADMIN, UserRole.MANAGER)
 * @Get('management')
 * async management() { ... }
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
