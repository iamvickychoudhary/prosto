import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '@common/enums';

/**
 * Photo Response DTO
 */
export class PhotoDto {
  @ApiProperty({
    example: 'photo-uuid-123',
    description: 'Unique photo ID',
  })
  id: string;

  @ApiProperty({
    example: 'https://storage.example.com/photos/abc123.jpg',
    description: 'Photo URL',
  })
  url: string;

  @ApiProperty({ example: 0, description: 'Photo order/position' })
  order: number;

  @ApiPropertyOptional({ example: true, description: 'Is this the primary photo' })
  is_primary?: boolean;
}

/**
 * Photo Upload Response DTO
 *
 * Response for POST /api/profile/{user_id}/photos
 */
export class PhotoUploadResponseDto {
  @ApiProperty({ type: PhotoDto, description: 'Uploaded photo details' })
  photo: PhotoDto;

  @ApiProperty({ type: [PhotoDto], description: 'All photos for this profile' })
  photos: PhotoDto[];

  @ApiProperty({ example: 2, description: 'Total number of photos' })
  photo_count: number;
}

/**
 * Photo Delete Response DTO
 *
 * Response for DELETE /api/profile/{user_id}/photos/{photo_id}
 */
export class PhotoDeleteResponseDto {
  @ApiProperty({
    example: 'photo-uuid-123',
    description: 'ID of the deleted photo',
  })
  deleted_photo_id: string;

  @ApiProperty({ example: 1, description: 'Remaining number of photos' })
  photo_count: number;
}

/**
 * Profile Update Response DTO
 *
 * Response for PATCH /api/profile/{user_id}
 */
export class ProfileUpdateResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'User ID',
  })
  user_id: string;

  @ApiPropertyOptional({ example: 'John', description: 'First name (if updated)' })
  first_name?: string;

  @ApiPropertyOptional({ enum: Gender, example: 'man', description: 'Gender (if updated)' })
  gender?: Gender;

  @ApiPropertyOptional({ enum: Gender, example: 'woman', description: 'Seeking (if updated)' })
  seeking?: Gender;

  @ApiPropertyOptional({ example: '1995-06-15', description: 'Date of birth (if updated)' })
  date_of_birth?: string;

  @ApiPropertyOptional({ example: 30, description: 'Calculated age (if DOB updated)' })
  age?: number;

  @ApiPropertyOptional({ example: 40.7128, description: 'Latitude (if location updated)' })
  latitude?: number;

  @ApiPropertyOptional({ example: -74.006, description: 'Longitude (if location updated)' })
  longitude?: number;

  @ApiPropertyOptional({ example: false, description: 'Location skipped status' })
  location_skipped?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Rules accepted (if updated)' })
  rules_accepted?: boolean;
}

/**
 * Complete User DTO
 */
export class CompleteUserDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'User ID',
  })
  id: string;

  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  email: string;

  @ApiProperty({ example: 'John', description: 'First name' })
  first_name: string;

  @ApiProperty({ example: 30, description: 'User age' })
  age: number;

  @ApiProperty({ enum: Gender, example: 'man', description: 'Gender' })
  gender: Gender;

  @ApiProperty({ enum: Gender, example: 'woman', description: 'Seeking' })
  seeking: Gender;

  @ApiProperty({ type: [PhotoDto], description: 'User photos' })
  photos: PhotoDto[];

  @ApiProperty({ example: '2026-02-04T10:35:00Z', description: 'Account creation date' })
  created_at: string;
}

/**
 * Auth Tokens DTO
 */
export class AuthTokensDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
  })
  access_token: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT refresh token',
  })
  refresh_token: string;

  @ApiProperty({ example: 'Bearer', description: 'Token type' })
  token_type: string;

  @ApiProperty({ example: 3600, description: 'Access token expiry in seconds' })
  expires_in: number;
}

/**
 * Profile Complete Response DTO
 *
 * Response for POST /api/profile/{user_id}/complete
 */
export class ProfileCompleteResponseDto {
  @ApiProperty({ type: CompleteUserDto, description: 'Created user information' })
  user: CompleteUserDto;

  @ApiProperty({ type: AuthTokensDto, description: 'Authentication tokens' })
  tokens: AuthTokensDto;
}
