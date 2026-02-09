import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '@common/enums/gender.enum';

/**
 * Complete User Photo DTO
 */
export class CompleteUserPhotoDto {
  @ApiProperty({ example: 'photo-1' })
  id: string;

  @ApiProperty({ example: 'https://storage.example.com/photos/abc123.jpg' })
  url: string;

  @ApiProperty({ example: true })
  is_primary: boolean;
}

/**
 * Complete User DTO
 */
export class CompleteUserDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'John' })
  first_name: string;

  @ApiProperty({ example: 30 })
  age: number;

  @ApiProperty({ enum: Gender, example: 'man' })
  gender: Gender;

  @ApiProperty({ enum: Gender, example: 'woman' })
  seeking: Gender;

  @ApiProperty({ type: [CompleteUserPhotoDto] })
  photos: CompleteUserPhotoDto[];

  @ApiProperty({ example: '2026-02-04T10:35:00Z' })
  created_at: string;
}

/**
 * Auth Tokens DTO
 */
export class AuthTokensDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refresh_token: string;

  @ApiProperty({ example: 'Bearer' })
  token_type: string;

  @ApiProperty({ example: 3600 })
  expires_in: number;
}

/**
 * Complete Profile Response DTO
 */
export class CompleteProfileResponseDto {
  @ApiProperty({ type: CompleteUserDto })
  user: CompleteUserDto;

  @ApiProperty({ type: AuthTokensDto })
  tokens: AuthTokensDto;
}
