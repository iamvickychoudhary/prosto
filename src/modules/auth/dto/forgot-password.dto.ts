import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for sending forgot password OTP
 */
export class ForgotPasswordDto {
    @ApiProperty({
        description: 'User email address',
        example: 'user@example.com',
    })
    @IsEmail({}, { message: 'Please enter a valid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;
}

/**
 * DTO for verifying forgot password OTP
 */
export class VerifyForgotPasswordDto {
    @ApiProperty({
        description: 'User email address',
        example: 'user@example.com',
    })
    @IsEmail({}, { message: 'Please enter a valid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @ApiProperty({
        description: 'OTP code sent to email',
        example: '123456',
        minLength: 4,
        maxLength: 6,
    })
    @IsString()
    @IsNotEmpty({ message: 'OTP is required' })
    @Length(4, 6, { message: 'OTP must be between 4 and 6 characters' })
    otp: string;
}