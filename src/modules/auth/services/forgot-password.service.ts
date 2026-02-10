import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '@config/app-config.service';
import { UserService } from '@modules/user/services/user.service';
import { UserEntity } from '@modules/user/entities/user.entity';
import { UserStatus, ErrorCode, SuccessCode } from '@common/enums';
import { SuccessMessages, createErrorResponse } from '@common/constants/messages.constants';
import { EmailService } from '@modules/email/services/email.service';
import { OtpRepository } from '../repositories/otp.repository';
import { ForgotPasswordDto, VerifyForgotPasswordDto } from '../dto/forgot-password.dto';
import { WinstonLoggerService } from '@core/logging/winston-logger.service';

const OTP_EXPIRY_SECONDS = 60;

/**
 * Forgot Password Service
 *
 * Handles password recovery via OTP verification.
 */
@Injectable()
export class ForgotPasswordService {
    constructor(
        private readonly otpRepository: OtpRepository,
        private readonly userService: UserService,
        private readonly emailService: EmailService,
        private readonly jwtService: JwtService,
        private readonly configService: AppConfigService,
        private readonly logger: WinstonLoggerService,
    ) {
        this.logger.setContext('ForgotPasswordService');
    }

    /**
     * Send OTP to user's email for password recovery
     */
    async sendForgotPasswordOtp(dto: ForgotPasswordDto) {
        // Find user by email
        const user = await this.userService.findByEmail(dto.email);

        if (!user) {
            throw new NotFoundException(createErrorResponse(ErrorCode.USER_NOT_FOUND));
        }

        // Check if account is active
        this.checkAccountStatus(user);

        // Generate OTP
        const otp = await this.otpRepository.createForEmail(dto.email);

        // Send OTP via email
        await this.sendOtpEmail(dto.email, otp.code);

        return {
            message: SuccessMessages[SuccessCode.OTP_SENT],
            otp_sent: true,
            otp: otp.code,
            expires_in: OTP_EXPIRY_SECONDS,
        };
    }

    /**
     * Verify OTP and return auth token (auto-login after password recovery)
     */
    async verifyForgotPasswordOtp(dto: VerifyForgotPasswordDto) {
        // Verify OTP
        const result = await this.otpRepository.verifyByEmail(dto.email, dto.otp);

        if (!result.valid) {
            const errorCode = this.mapOtpErrorToCode(result.error);
            throw new BadRequestException(createErrorResponse(errorCode));
        }

        // Find user
        const user = await this.userService.findByEmail(dto.email);

        if (!user) {
            throw new NotFoundException(createErrorResponse(ErrorCode.USER_NOT_FOUND));
        }

        // Check if account is active
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
                subject: 'Password Recovery Code',
                html: `
          <h1>Password Recovery</h1>
          <p>You requested to recover your password. Your one-time password is: <strong>${code}</strong></p>
          <p>This code expires in ${OTP_EXPIRY_SECONDS} seconds.</p>
          <p>If you didn't request this code, please ignore this email and ensure your account is secure.</p>
        `,
            });
        } catch (error) {
            // Log error but don't fail the request
            this.logger.error(`Failed to send forgot password OTP email: ${(error as Error).message}`);
        }
    }

    /**
     * Check if user account is active (not suspended or deleted)
     */
    private checkAccountStatus(user: UserEntity): void {
        if (user.status === UserStatus.SUSPENDED) {
            throw new BadRequestException(createErrorResponse(ErrorCode.ACCOUNT_SUSPENDED));
        }

        if (user.status === UserStatus.INACTIVE) {
            throw new BadRequestException(createErrorResponse(ErrorCode.ACCOUNT_INACTIVE));
        }

        if (user.status === UserStatus.DELETED) {
            throw new NotFoundException(createErrorResponse(ErrorCode.USER_NOT_FOUND));
        }
    }
}