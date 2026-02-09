import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT Refresh Guard
 *
 * Validates refresh tokens for token refresh endpoint
 */
@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {}
