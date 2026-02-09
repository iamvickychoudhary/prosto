import { Controller, Post, Body, HttpCode, HttpStatus, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { OtpService } from '../services/otp.service';
import { SendOtpDto, VerifyOtpDto, ResendOtpDto } from '../dto/otp-login.dto';
import { OtpSendResponseDto, OtpVerifyResponseDto } from '../dto/otp-response.dto';
import { Public } from '../decorators/public.decorator';
import { ApiErrorResponses } from '@core/decorators/api-response.decorator';
import { ErrorCode, SuccessCode } from '@common/enums';
import { ErrorMessages, SuccessMessages } from '@common/constants/messages.constants';

/**
 * Login Controller
 *
 * Handles OTP-based authentication for login.
 * Endpoints: POST /api/login, POST /api/login/verify-otp, POST /api/login/resend-otp
 */
@ApiTags('auth')
@Controller({ path: 'login', version: VERSION_NEUTRAL })
@ApiErrorResponses()
export class LoginController {
  constructor(private readonly otpService: OtpService) {}

  /**
   * Step 1: Send OTP to phone or email
   */
  @Post()
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send OTP for login',
    description: `
Send a one-time password to the user's phone or email for authentication.

**Request Options:**
- Send via email: \`{ "email": "user@example.com" }\`
- Send via phone: \`{ "country_code": "+1", "phone": "3316238413" }\`
    `,
  })
  @ApiBody({ type: SendOtpDto })
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
  @ApiResponse({
    status: 403,
    description: ErrorMessages[ErrorCode.ACCOUNT_SUSPENDED],
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        error: {
          type: 'object',
          properties: {
            code: { type: 'string', example: ErrorCode.ACCOUNT_SUSPENDED },
            message: { type: 'string', example: ErrorMessages[ErrorCode.ACCOUNT_SUSPENDED] },
          },
        },
      },
    },
  })
  async sendOtp(@Body() dto: SendOtpDto): Promise<OtpSendResponseDto> {
    return this.otpService.sendOtp(dto);
  }

  /**
   * Step 2: Verify OTP and get access token
   */
  @Post('verify-otp')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify OTP and login',
    description: `
Verify the OTP code and receive an authentication token.

**Request Options:**
- Verify via email: \`{ "email": "user@example.com", "otp": "1234" }\`
- Verify via phone: \`{ "country_code": "+1", "phone": "3316238413", "otp": "1234" }\`
    `,
  })
  @ApiBody({ type: VerifyOtpDto })
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
  async verifyOtp(@Body() dto: VerifyOtpDto): Promise<OtpVerifyResponseDto> {
    return this.otpService.verifyOtp(dto);
  }

  /**
   * Resend OTP
   */
  @Post('resend-otp')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resend OTP',
    description: "Resend the OTP to the user's phone or email. Same request format as login.",
  })
  @ApiBody({ type: ResendOtpDto })
  @ApiResponse({
    status: 200,
    description: SuccessMessages[SuccessCode.OTP_SENT],
    type: OtpSendResponseDto,
  })
  async resendOtp(@Body() dto: ResendOtpDto): Promise<OtpSendResponseDto> {
    return this.otpService.resendOtp(dto);
  }
}
