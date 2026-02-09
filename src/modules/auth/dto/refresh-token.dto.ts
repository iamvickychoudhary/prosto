import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Refresh Token DTO
 */
export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token received during login',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
