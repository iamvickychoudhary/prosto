import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Get,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { TokenRefreshResponseDto } from '../dto/otp-response.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Public } from '../decorators/public.decorator';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';
import { ApiErrorResponses } from '@core/decorators/api-response.decorator';
import { SuccessCode } from '@common/enums';
import { SuccessMessages } from '@common/constants/messages.constants';

/**
 * Authentication Controller
 *
 * Handles auth endpoints including token refresh.
 * Endpoints: POST /api/auth/token/refresh, POST /api/auth/register, etc.
 */
@ApiTags('auth')
@Controller({ path: 'auth', version: VERSION_NEUTRAL })
@ApiErrorResponses()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: SuccessMessages[SuccessCode.ACCOUNT_CREATED],
  })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with credentials' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: SuccessMessages[SuccessCode.LOGIN_SUCCESS],
  })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * Token Refresh - POST /api/auth/token/refresh
   */
  @Post('token/refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Use refresh token to get a new access token',
  })
  @ApiResponse({
    status: 200,
    description: SuccessMessages[SuccessCode.TOKEN_REFRESHED],
    type: TokenRefreshResponseDto,
  })
  async refreshToken(@CurrentUser() user: IJwtPayload) {
    return this.authService.refreshAccessToken(user.sub);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout current user' })
  @ApiResponse({
    status: 200,
    description: SuccessMessages[SuccessCode.LOGOUT_SUCCESS],
  })
  async logout(@CurrentUser() user: IJwtPayload) {
    return this.authService.logout(user.sub);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  async me(@CurrentUser() user: IJwtPayload) {
    return this.authService.getCurrentUser(user.sub);
  }
}
