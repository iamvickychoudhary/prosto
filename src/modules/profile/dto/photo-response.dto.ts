import { ApiProperty } from '@nestjs/swagger';

/**
 * Photo DTO
 */
export class PhotoDto {
  @ApiProperty({ example: 'photo-uuid-123' })
  id: string;

  @ApiProperty({ example: 'https://storage.example.com/photos/abc123.jpg' })
  url: string;

  @ApiProperty({ example: 0 })
  order: number;
}

/**
 * Photo Upload Response DTO
 */
export class PhotoUploadResponseDto {
  @ApiProperty({ type: PhotoDto })
  photo: PhotoDto;

  @ApiProperty({ type: [PhotoDto] })
  photos: PhotoDto[];

  @ApiProperty({ example: 2 })
  photo_count: number;
}

/**
 * Photo Delete Response DTO
 */
export class PhotoDeleteResponseDto {
  @ApiProperty({ example: 'photo-uuid-123' })
  deleted_photo_id: string;

  @ApiProperty({ example: 1 })
  photo_count: number;
}
