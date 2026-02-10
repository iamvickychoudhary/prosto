import { Controller, Post, Body, HttpCode, HttpStatus, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { ForgotPasswordService } from '../services/forgot-password.service';
import { ForgotPasswordDto, VerifyForgotPasswordDto } from '../dto/forgot-password.dto';
import { OtpSendResponseDto, OtpVerifyResponseDto } from '../dto/otp-response.dto';
import { Public } from '../decorators/public.decorator';
import { ApiErrorResponses } from '@core/decorators/api-response.decorator';
import { ErrorCode, SuccessCode } from '@common/enums';
import { ErrorMessages, SuccessMessages } from '@common/constants/messages.constants';

/**
 * Forgot Password Controller
 *
 * Handles password recovery via OTP verification.
 * Endpoints: POST /api/forgot-password, POST /api/forgot-password/verify
 */
@ApiTags('auth')
@Controller({ path: 'forgot-password', version: VERSION_NEUTRAL })
@ApiErrorResponses()
export class ForgotPasswordController {
    constructor(private readonly forgotPasswordService: ForgotPasswordService) { }

    /**
     * Step 1: Send OTP for password recovery
     */
    @Post()
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Send OTP for password recovery',
        description: `
Send a one-time password to the user's email for password recovery.

**Request:**
\`{ "email": "user@example.com" }\`

**Flow:**
1. User enters their email
2. System sends OTP to email
3. User receives OTP and clicks "Enter Code"
4. User verifies OTP in next step
    `,
    })
    @ApiBody({ type: ForgotPasswordDto })
    @ApiResponse({
        status: 200,
        description: SuccessMessages[SuccessCode.OTP_SENT],
        type: OtpSendResponseDto,
    })
    @ApiResponse({
        status: 404,
        description: ErrorMessages[ErrorCode.USER_NOT_FOUND],
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: false },
                error: {
                    type: 'object',
                    properties: {
                        code: { type: 'string', example: ErrorCode.USER_NOT_FOUND },
                        message: { type: 'string', example: ErrorMessages[ErrorCode.USER_NOT_FOUND] },
                    },
                },
            },
        },
    })
    async sendOtp(@Body() dto: ForgotPasswordDto): Promise<OtpSendResponseDto> {
        return this.forgotPasswordService.sendForgotPasswordOtp(dto);
    }

    /**
     * Step 2: Verify OTP and auto-login
     */
    @Post('verify')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Verify OTP and auto-login',
        description: `
Verify the OTP code and receive an authentication token (auto-login).

**Request:**
\`{ "email": "user@example.com", "otp": "123456" }\`

**Response:**
Returns user info and access token for automatic login after password recovery.
    `,
    })
    @ApiBody({ type: VerifyForgotPasswordDto })
    @ApiResponse({
        status: 200,
        description: SuccessMessages[SuccessCode.OTP_VERIFIED],
        type: OtpVerifyResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: ErrorMessages[ErrorCode.INVALID_OTP],
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: false },
                error: {
                    type: 'object',
                    properties: {
                        code: { type: 'string', example: ErrorCode.INVALID_OTP },
                        message: { type: 'string', example: ErrorMessages[ErrorCode.INVALID_OTP] },
                    },
                },
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: ErrorMessages[ErrorCode.OTP_EXPIRED],
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: false },
                error: {
                    type: 'object',
                    properties: {
                        code: { type: 'string', example: ErrorCode.OTP_EXPIRED },
                        message: { type: 'string', example: ErrorMessages[ErrorCode.OTP_EXPIRED] },
                    },
                },
            },
        },
    })
    async verifyOtp(@Body() dto: VerifyForgotPasswordDto): Promise<OtpVerifyResponseDto> {
        return this.forgotPasswordService.verifyForgotPasswordOtp(dto);
    }
}