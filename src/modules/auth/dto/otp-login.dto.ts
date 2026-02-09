import { IsEmail, IsString, ValidateIf, IsNotEmpty, Matches, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Send OTP DTO
 *
 * Used for POST /api/login - send OTP to phone or email.
 */
export class SendOtpDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address (required if phone not provided)',
    required: false,
  })
  @ValidateIf(o => !o.phone)
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email?: string;

  @ApiProperty({
    example: '+1',
    description: 'Country code (required if phone provided)',
    required: false,
  })
  @ValidateIf(o => o.phone)
  @IsString()
  @IsNotEmpty({ message: 'Country code is required with phone number' })
  @Matches(/^\+\d{1,4}$/, { message: 'Invalid country code format' })
  country_code?: string;

  @ApiProperty({
    example: '3316238413',
    description: 'Phone number without country code (required if email not provided)',
    required: false,
  })
  @ValidateIf(o => !o.email)
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^\d{7,15}$/, { message: 'Invalid phone number format' })
  phone?: string;
}

/**
 * Verify OTP DTO
 *
 * Used for POST /api/login/verify-otp.
 */
export class VerifyOtpDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address (required if phone not provided)',
    required: false,
  })
  @ValidateIf(o => !o.phone)
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email?: string;

  @ApiProperty({
    example: '+1',
    description: 'Country code (required if phone provided)',
    required: false,
  })
  @ValidateIf(o => o.phone)
  @IsString()
  @Matches(/^\+\d{1,4}$/, { message: 'Invalid country code format' })
  country_code?: string;

  @ApiProperty({
    example: '3316238413',
    description: 'Phone number without country code (required if email not provided)',
    required: false,
  })
  @ValidateIf(o => !o.email)
  @IsString()
  @Matches(/^\d{7,15}$/, { message: 'Invalid phone number format' })
  phone?: string;

  @ApiProperty({
    example: '1234',
    description: '4-digit OTP code',
  })
  @IsString()
  @IsNotEmpty({ message: 'OTP is required' })
  @Length(4, 6, { message: 'OTP must be 4-6 digits' })
  @Matches(/^\d+$/, { message: 'OTP must contain only digits' })
  otp: string;
}

/**
 * Resend OTP DTO (same as SendOtpDto)
 */
export class ResendOtpDto extends SendOtpDto {}
