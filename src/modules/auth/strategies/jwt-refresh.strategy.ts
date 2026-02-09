import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { AppConfigService } from '@config/app-config.service';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';

/**
 * JWT Refresh Strategy
 *
 * Validates JWT refresh tokens from request body.
 * Used with @UseGuards(JwtRefreshGuard)
 */
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(configService: AppConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: configService.jwtRefreshSecret,
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: IJwtPayload): Promise<IJwtPayload> {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return payload;
  }
}
