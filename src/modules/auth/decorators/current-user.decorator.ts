import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';

/**
 * Current User Decorator
 *
 * Extracts the authenticated user from the request.
 *
 * Usage:
 * @Get('profile')
 * async getProfile(@CurrentUser() user: IJwtPayload) { ... }
 *
 * // Or get specific property
 * @Get('profile')
 * async getProfile(@CurrentUser('email') email: string) { ... }
 */
export const CurrentUser = createParamDecorator(
  (data: keyof IJwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as IJwtPayload;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);
