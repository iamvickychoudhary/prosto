import { ApiProperty } from '@nestjs/swagger';

/**
 * Draft Response DTO
 *
 * Response after creating a draft profile.
 */
export class DraftResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Unique identifier for the draft profile',
  })
  user_id: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  email: string;
}
