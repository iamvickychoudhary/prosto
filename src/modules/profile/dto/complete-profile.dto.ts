import { IsString, IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Match } from '@common/decorators/match.decorator';

/**
 * Complete Profile DTO
 *
 * Used for POST /api/profile/{user_id}/complete - finalizing registration.
 */
export class CompleteProfileDto {
  @ApiProperty({
    example: 'SecurePassword123!',
    description: 'User password (min 8 chars, 1 uppercase, 1 lowercase, 1 number)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(100, { message: 'Password must not exceed 100 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number',
  })
  password: string;

  @ApiProperty({
    example: 'SecurePassword123!',
    description: 'Password confirmation (must match password)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password confirmation is required' })
  @Match('password', { message: 'Passwords do not match' })
  confirm_password: string;
}
