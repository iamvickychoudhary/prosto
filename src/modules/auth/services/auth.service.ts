import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AppConfigService } from '@config/app-config.service';
import { UserService } from '@modules/user/services/user.service';
import { UserEntity } from '@modules/user/entities/user.entity';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { IAuthTokens } from '../interfaces/auth-tokens.interface';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';
import {
  EntityAlreadyExistsException,
  EntityNotFoundException,
} from '@core/exceptions/business.exception';

/**
 * Authentication Service
 *
 * Handles all authentication business logic:
 * - User registration
 * - Login and token generation
 * - Token refresh
 * - Password hashing and validation
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: AppConfigService,
    private readonly userService: UserService,
  ) {}

  /**
   * Register a new user
   */
  async register(dto: RegisterDto): Promise<IAuthTokens> {
    // Check if user already exists
    const existingUser = await this.userService.findByEmail(dto.email);
    if (existingUser) {
      throw new EntityAlreadyExistsException('User', 'email');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(dto.password);

    // Create user
    const user = await this.userService.create({
      ...dto,
      password: hashedPassword,
    });

    // Generate tokens
    return this.generateTokens(user.id, user.email, user.role);
  }

  /**
   * Login with credentials
   */
  async login(dto: LoginDto): Promise<IAuthTokens> {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.comparePasswords(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.userService.updateLastLogin(user.id);

    return this.generateTokens(user.id, user.email, user.role);
  }

  /**
   * Refresh all tokens (access + refresh)
   */
  async refreshTokens(userId: string): Promise<IAuthTokens> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new EntityNotFoundException('User', userId);
    }

    return this.generateTokens(user.id, user.email, user.role);
  }

  /**
   * Refresh access token only (for /api/auth/token/refresh)
   * Returns only the access token as per spec
   */
  async refreshAccessToken(userId: string): Promise<{
    access_token: string;
    token_type: string;
    expires_in: number;
  }> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new EntityNotFoundException('User', userId);
    }

    const payload: IJwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: this.parseExpiresIn(this.configService.jwtExpiresIn),
    };
  }

  /**
   * Parse expires_in string to seconds
   */
  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 3600;

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 3600;
    }
  }

  /**
   * Logout user
   */
  async logout(_userId: string): Promise<{ message: string }> {
    // In a real implementation, you would:
    // - Invalidate refresh token in database/redis
    // - Add token to blacklist if needed
    return { message: 'Logged out successfully' };
  }

  /**
   * Get current user profile (without sensitive data)
   */
  async getCurrentUser(userId: string): Promise<
    Omit<UserEntity, 'password' | 'fullName' | 'age'> & {
      fullName: string;
      age: number | null;
    }
  > {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new EntityNotFoundException('User', userId);
    }

    // Remove sensitive data using rest operator
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...profile } = user;
    return {
      ...profile,
      fullName: user.fullName,
      age: user.age,
    };
  }

  /**
   * Generate access and refresh tokens
   */
  private generateTokens(userId: string, email: string, role: string): IAuthTokens {
    const payload: IJwtPayload = {
      sub: userId,
      email,
      role,
    };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.jwtRefreshSecret,
      expiresIn: this.configService.jwtRefreshExpiresIn,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.configService.jwtExpiresIn,
    };
  }

  /**
   * Hash password using bcrypt
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare password with hash
   */
  private async comparePasswords(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
