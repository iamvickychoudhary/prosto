import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '@config/app-config.service';
import { UserService } from '@modules/user/services/user.service';
import { UserEntity } from '@modules/user/entities/user.entity';
import { UserStatus, ErrorCode, SuccessCode } from '@common/enums';
import { SuccessMessages, createErrorResponse } from '@common/constants/messages.constants';
import { EmailService } from '@modules/email/services/email.service';
import { OtpRepository } from '../repositories/otp.repository';
import { SendOtpDto, VerifyOtpDto } from '../dto/otp-login.dto';
import { WinstonLoggerService } from '@core/logging/winston-logger.service';

const OTP_EXPIRY_SECONDS = 60;

/**
 * OTP Service
 *
 * Handles OTP-based authentication.
 */
@Injectable()
export class OtpService {
  constructor(
    private readonly otpRepository: OtpRepository,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
    private readonly configService: AppConfigService,
    private readonly logger: WinstonLoggerService,
  ) {
    this.logger.setContext('OtpService');
  }

  /**
   * Send OTP to user's phone or email
   */
  async sendOtp(dto: SendOtpDto) {
    // Find user by email or phone
    const user = dto.email
      ? await this.userService.findByEmail(dto.email)
      : await this.findUserByPhone(dto.country_code!, dto.phone!);

    if (!user) {
      throw new NotFoundException(createErrorResponse(ErrorCode.USER_NOT_FOUND));
    }

    // Check if account is suspended
    this.checkAccountStatus(user);

    // Generate OTP
    const otp = dto.email
      ? await this.otpRepository.createForEmail(dto.email)
      : await this.otpRepository.createForPhone(dto.country_code!, dto.phone!);

    // Send OTP (email or SMS)
    if (dto.email) {
      await this.sendOtpEmail(dto.email, otp.code);
    } else {
      await this.sendOtpSms(dto.country_code!, dto.phone!, otp.code);
    }

    return {
      message: SuccessMessages[SuccessCode.OTP_SENT],
      otp_sent: true,
      otp: otp.code,
      expires_in: OTP_EXPIRY_SECONDS,
    };
  }

  /**
   * Verify OTP and return auth tokens
   */
  async verifyOtp(dto: VerifyOtpDto) {
    // Verify OTP
    const result = dto.email
      ? await this.otpRepository.verifyByEmail(dto.email, dto.otp)
      : await this.otpRepository.verifyByPhone(dto.country_code!, dto.phone!, dto.otp);

    if (!result.valid) {
      const errorCode = this.mapOtpErrorToCode(result.error);
      throw new BadRequestException(createErrorResponse(errorCode));
    }

    // Find user
    const user = dto.email
      ? await this.userService.findByEmail(dto.email)
      : await this.findUserByPhone(dto.country_code!, dto.phone!);

    if (!user) {
      throw new NotFoundException(createErrorResponse(ErrorCode.USER_NOT_FOUND));
    }

    // Check if account is suspended
    this.checkAccountStatus(user);

    // Update last login
    await this.userService.updateLastLogin(user.id);

    // Generate access token
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    // Return complete user data
    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone ? `${user.countryCode}${user.phone}` : undefined,
        country_code: user.countryCode,
        first_name: user.firstName,
        last_name: user.lastName,
        full_name: user.fullName,
        role: user.role,
        status: user.status,
        avatar_url: user.avatarUrl,
        email_verified: user.emailVerified,
        email_verified_at: user.emailVerifiedAt,
        last_login_at: user.lastLoginAt,
        gender: user.gender,
        seeking: user.seeking,
        date_of_birth: user.dateOfBirth,
        age: user.age,
        latitude: user.latitude,
        longitude: user.longitude,
        location_skipped: user.locationSkipped,
        // Extended profile fields
        about_me: user.aboutMe,
        current_work: user.currentWork,
        school: user.school,
        looking_for: user.lookingFor,
        pets: user.pets,
        children: user.children,
        astrological_sign: user.astrologicalSign,
        religion: user.religion,
        education: user.education,
        height: user.height,
        body_type: user.bodyType,
        exercise: user.exercise,
        drink: user.drink,
        smoker: user.smoker,
        marijuana: user.marijuana,
        photos: user.photos?.map(photo => ({
          id: photo.id,
          url: photo.photoUrl,
          order: photo.photoOrder,
          is_primary: photo.isPrimary,
          created_at: photo.createdAt,
        })) || [],
        created_at: user.createdAt,
        updated_at: user.updatedAt,
      },
      access_token: accessToken,
    };
  }

  /**
   * Resend OTP
   */
  async resendOtp(dto: SendOtpDto) {
    return this.sendOtp(dto);
  }

  /**
   * Find user by phone number
   */
  private async findUserByPhone(countryCode: string, phone: string): Promise<UserEntity | null> {
    return this.userService.findByPhone(countryCode, phone);
  }

  /**
   * Map OTP repository error to ErrorCode enum
   */
  private mapOtpErrorToCode(error: string | undefined): ErrorCode {
    const errorMap: Record<string, ErrorCode> = {
      OTP_NOT_FOUND: ErrorCode.OTP_NOT_FOUND,
      OTP_EXPIRED: ErrorCode.OTP_EXPIRED,
      MAX_ATTEMPTS_EXCEEDED: ErrorCode.MAX_ATTEMPTS_EXCEEDED,
      INVALID_OTP: ErrorCode.INVALID_OTP,
    };
    return errorMap[error || ''] || ErrorCode.INVALID_OTP;
  }

  /**
   * Send OTP via email
   */
  private async sendOtpEmail(email: string, code: string): Promise<void> {
    try {
      await this.emailService.send({
        to: email,
        subject: 'Your Login Code',
        html: `
          <h1>Your Login Code</h1>
          <p>Your one-time password is: <strong>${code}</strong></p>
          <p>This code expires in ${OTP_EXPIRY_SECONDS} seconds.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        `,
      });
    } catch (error) {
      // Log error but don't fail the request
      this.logger.error(`Failed to send OTP email: ${(error as Error).message}`);
    }
  }

  /**
   * Send OTP via SMS
   */
  private async sendOtpSms(countryCode: string, phone: string, code: string): Promise<void> {
    // In production, integrate with SMS provider (Twilio, AWS SNS, etc.)
    // For now, just log the OTP
    this.logger.log(`[SMS] Sending OTP ${code} to ${countryCode}${phone}`);
  }

  /**
   * Check if user account is active (not suspended)
   */
  private checkAccountStatus(user: UserEntity): void {
    if (user.status === UserStatus.SUSPENDED) {
      throw new ForbiddenException(createErrorResponse(ErrorCode.ACCOUNT_SUSPENDED));
    }

    if (user.status === UserStatus.INACTIVE) {
      throw new ForbiddenException(createErrorResponse(ErrorCode.ACCOUNT_INACTIVE));
    }

    if (user.status === UserStatus.DELETED) {
      throw new NotFoundException(createErrorResponse(ErrorCode.USER_NOT_FOUND));
    }
  }
}
