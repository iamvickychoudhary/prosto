import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * OTP Send Response DTO
 *
 * Response for POST /api/login and POST /api/login/resend-otp
 */
export class OtpSendResponseDto {
  @ApiProperty({ example: 'OTP sent successfully', description: 'Success message' })
  message: string;

  @ApiProperty({ example: true, description: 'Indicates OTP was sent' })
  otp_sent: boolean;

  @ApiProperty({ example: 60, description: 'OTP expiry time in seconds' })
  expires_in: number;
}

/**
 * Login User Response DTO
 *
 * User object returned after successful OTP verification
 */
export class LoginUserResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Unique user ID',
  })
  id: string;

  @ApiPropertyOptional({
    example: 'user@example.com',
    description: 'User email address',
  })
  email?: string;

  @ApiPropertyOptional({
    example: '+13316238413',
    description: 'Full phone number with country code',
  })
  phone?: string;

  @ApiProperty({ example: 'John', description: 'User first name' })
  first_name: string;
}

/**
 * OTP Verify Response DTO
 *
 * Response for POST /api/login/verify-otp
 */
export class OtpVerifyResponseDto {
  @ApiProperty({ type: LoginUserResponseDto, description: 'User information' })
  user: LoginUserResponseDto;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
  })
  access_token: string;
}

/**
 * Token Refresh Response DTO
 *
 * Response for POST /api/auth/token/refresh
 */
export class TokenRefreshResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'New JWT access token',
  })
  access_token: string;

  @ApiProperty({ example: 'Bearer', description: 'Token type' })
  token_type: string;

  @ApiProperty({ example: 3600, description: 'Token expiry time in seconds' })
  expires_in: number;
}
