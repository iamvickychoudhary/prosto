import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  IsBoolean,
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
}
