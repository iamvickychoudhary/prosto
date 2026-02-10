import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  IsBoolean,
  IsArray,
  MinLength,
  MaxLength,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '@common/enums/gender.enum';

/**
 * Update Profile DTO
 *
 * Used for PATCH /api/profile/{user_id} - updating profile fields step by step.
 */
export class UpdateProfileDto {
  @ApiProperty({
    example: 'John',
    description: 'User first name',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters' })
  @MaxLength(100, { message: 'First name must not exceed 100 characters' })
  @Matches(/^[a-zA-Z\s\-']+$/, {
    message: 'First name can only contain letters, spaces, hyphens, and apostrophes',
  })
  first_name?: string;

  @ApiProperty({
    example: 'man',
    description: 'User gender',
    enum: Gender,
    required: false,
  })
  @IsOptional()
  @IsEnum(Gender, { message: 'Gender must be either "man" or "woman"' })
  gender?: Gender;

  @ApiProperty({
    example: 'woman',
    description: 'Gender the user is seeking',
    enum: Gender,
    required: false,
  })
  @IsOptional()
  @IsEnum(Gender, { message: 'Seeking must be either "man" or "woman"' })
  seeking?: Gender;

  @ApiProperty({
    example: '1995-06-15',
    description: 'Date of birth (YYYY-MM-DD format)',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Date of birth must be in YYYY-MM-DD format' })
  date_of_birth?: string;

  @ApiProperty({
    example: 40.7128,
    description: 'Latitude coordinate',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Latitude must be a number' })
  @Min(-90, { message: 'Latitude must be between -90 and 90' })
  @Max(90, { message: 'Latitude must be between -90 and 90' })
  latitude?: number;

  @ApiProperty({
    example: -74.006,
    description: 'Longitude coordinate',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Longitude must be a number' })
  @Min(-180, { message: 'Longitude must be between -180 and 180' })
  @Max(180, { message: 'Longitude must be between -180 and 180' })
  longitude?: number;

  @ApiProperty({
    example: true,
    description: 'Whether location was skipped',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  location_skipped?: boolean;

  @ApiProperty({
    example: true,
    description: 'Whether user accepted the rules',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  rules_accepted?: boolean;

  // Extended dating profile fields
  @ApiProperty({
    example: 'I love hiking and exploring new places...',
    description: 'About me section',
    required: false,
  })
  @IsOptional()
  @IsString()
  about_me?: string;

  @ApiProperty({
    example: 'Software Engineer at Google',
    description: 'Current work/job',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  current_work?: string;

  @ApiProperty({
    example: 'Stanford University',
    description: 'School/University',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  school?: string;

  @ApiProperty({
    example: ['Long-term relationship', 'Marriage'],
    description: 'What user is looking for',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  looking_for?: string[];

  @ApiProperty({
    example: ['Dog', 'Cat'],
    description: 'Pets user has',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pets?: string[];

  @ApiProperty({
    example: 'Want someday',
    description: 'Children preference',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  children?: string;

  @ApiProperty({
    example: 'Aries',
    description: 'Astrological sign',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  astrological_sign?: string;

  @ApiProperty({
    example: 'Christian',
    description: 'Religion',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  religion?: string;

  @ApiProperty({
    example: 'Bachelors Degree',
    description: 'Education level',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  education?: string;

  @ApiProperty({
    example: '5\'10"',
    description: 'Height',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  height?: string;

  @ApiProperty({
    example: 'Athletic',
    description: 'Body type',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  body_type?: string;

  @ApiProperty({
    example: 'Often',
    description: 'Exercise frequency',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  exercise?: string;

  @ApiProperty({
    example: 'Socially',
    description: 'Drinking habits',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  drink?: string;

  @ApiProperty({
    example: 'No',
    description: 'Smoking habits',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  smoker?: string;

  @ApiProperty({
    example: 'Never',
    description: 'Marijuana usage',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  marijuana?: string;

  @ApiProperty({
    example: [
      { url: 'https://example.com/photo1.jpg', order: 0 },
      { url: 'https://example.com/photo2.jpg', order: 1 }
    ],
    description: 'User photos (replaces all existing photos)',
    type: 'array',
    required: false,
  })
  @IsOptional()
  @IsArray()
  photos?: Array<{ url: string; order: number }>;
}
