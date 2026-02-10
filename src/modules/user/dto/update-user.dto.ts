import { IsEmail, IsString, IsOptional, IsEnum, MaxLength, IsUrl, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@common/enums/user-role.enum';
import { UserStatus } from '@common/enums/user-status.enum';

/**
 * Update User DTO
 *
 * All fields are optional for partial updates.
 */
export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    example: 'John',
    description: 'User first name',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({
    example: 'Doe',
    description: 'User last name',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({
    example: '+1234567890',
    description: 'User phone number',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({
    enum: UserRole,
    example: UserRole.USER,
    description: 'User role',
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({
    enum: UserStatus,
    example: UserStatus.ACTIVE,
    description: 'User status',
  })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'User avatar URL',
  })
  @IsUrl()
  @IsOptional()
  avatarUrl?: string;

  // Extended dating profile fields
  @ApiPropertyOptional({
    example: 'I love hiking and exploring new places...',
    description: 'About me section',
  })
  @IsString()
  @IsOptional()
  aboutMe?: string;

  @ApiPropertyOptional({
    example: 'Software Engineer at Google',
    description: 'Current work/job',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  currentWork?: string;

  @ApiPropertyOptional({
    example: 'Stanford University',
    description: 'School/University',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  school?: string;

  @ApiPropertyOptional({
    example: ['Long-term relationship', 'Marriage'],
    description: 'What user is looking for',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  lookingFor?: string[];

  @ApiPropertyOptional({
    example: ['Dog', 'Cat'],
    description: 'Pets user has',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  pets?: string[];

  @ApiPropertyOptional({
    example: 'Want someday',
    description: 'Children preference',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  children?: string;

  @ApiPropertyOptional({
    example: 'Aries',
    description: 'Astrological sign',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  astrologicalSign?: string;

  @ApiPropertyOptional({
    example: 'Christian',
    description: 'Religion',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  religion?: string;

  @ApiPropertyOptional({
    example: 'Bachelors Degree',
    description: 'Education level',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  education?: string;

  @ApiPropertyOptional({
    example: '5\'10"',
    description: 'Height',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  height?: string;

  @ApiPropertyOptional({
    example: 'Athletic',
    description: 'Body type',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  bodyType?: string;

  @ApiPropertyOptional({
    example: 'Often',
    description: 'Exercise frequency',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  exercise?: string;

  @ApiPropertyOptional({
    example: 'Socially',
    description: 'Drinking habits',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  drink?: string;

  @ApiPropertyOptional({
    example: 'No',
    description: 'Smoking habits',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  smoker?: string;

  @ApiPropertyOptional({
    example: 'Never',
    description: 'Marijuana usage',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  marijuana?: string;
}
