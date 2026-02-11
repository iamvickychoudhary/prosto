import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class SimpleUserDto {
    @ApiProperty()
    @Expose()
    id: string;

    @ApiProperty()
    @Expose()
    email: string;

    @ApiProperty()
    @Expose()
    firstName: string;

    @ApiProperty({ required: false })
    @Expose()
    lastName?: string;

    @ApiProperty()
    @Expose()
    fullName: string;

    @ApiProperty({ required: false })
    @Expose()
    avatarUrl?: string;

    @ApiProperty()
    @Expose()
    age?: number;

    @ApiProperty({ required: false })
    @Expose()
    gender?: string;
}
