import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigService } from '@config/app-config.service';
import { AuthService } from './services/auth.service';
import { OtpService } from './services/otp.service';
import { ForgotPasswordService } from './services/forgot-password.service';
import { AuthController } from './controllers/auth.controller';
import { LoginController } from './controllers/login.controller';
import { ForgotPasswordController } from './controllers/forgot-password.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { OtpEntity } from './entities/otp.entity';
import { OtpRepository } from './repositories/otp.repository';
import { UserModule } from '@modules/user/user.module';
import { EmailModule } from '@modules/email/email.module';

/**
 * Authentication Module
 *
 * Handles all authentication concerns:
 * - JWT token generation and validation
 * - Passport strategies
 * - Auth guards
 * - Login/Register/Refresh flows
 * - OTP-based authentication
 * - Password recovery
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([OtpEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (configService: AppConfigService) => ({
        secret: configService.jwtSecret,
        signOptions: {
          expiresIn: configService.jwtExpiresIn,
        },
      }),
      inject: [AppConfigService],
    }),
    UserModule,
    EmailModule,
  ],
  controllers: [AuthController, LoginController, ForgotPasswordController],
  providers: [AuthService, OtpService, ForgotPasswordService, OtpRepository, JwtStrategy, JwtRefreshStrategy],
  exports: [AuthService, OtpService, JwtModule],
})
export class AuthModule { }
