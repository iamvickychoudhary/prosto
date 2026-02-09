import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '@common/enums/user-role.enum';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';

/**
 * Roles Guard
 *
 * Checks if user has required role(s) to access a route.
 * Use with @Roles() decorator.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{ user: IJwtPayload }>();

    if (!user || !user.role) {
      return false;
    }

    return requiredRoles.some(role => role === user.role);
  }
}
