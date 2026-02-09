import { IsString, IsOptional, IsInt, Min, Max, IsArray, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Search Query Type
 */
export enum SearchQueryType {
  SIMPLE = 'simple',
  FULL = 'full',
  SEMANTIC = 'semantic',
}

/**
 * Search Query DTO
 */
export class SearchQueryDto {
  @ApiProperty({
    description: 'Search query string',
    example: 'product name',
  })
  @IsString()
  query: string;

  @ApiPropertyOptional({
    description: 'Filter expression',
    example: "category eq 'electronics'",
  })
  @IsString()
  @IsOptional()
  filter?: string;

  @ApiPropertyOptional({
    description: 'Fields to select',
    example: ['id', 'name', 'description'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  select?: string[];

  @ApiPropertyOptional({
    description: 'Fields to order by',
    example: ['score desc', 'name asc'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  orderBy?: string[];

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 100,
    default: 10,
    description: 'Number of results to return',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  top?: number = 10;

  @ApiPropertyOptional({
    minimum: 0,
    default: 0,
    description: 'Number of results to skip',
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  skip?: number = 0;

  @ApiPropertyOptional({
    description: 'Fields to use for faceted navigation',
    example: ['category', 'brand'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  facets?: string[];

  @ApiPropertyOptional({
    enum: SearchQueryType,
    default: SearchQueryType.SIMPLE,
    description: 'Query type',
  })
  @IsEnum(SearchQueryType)
  @IsOptional()
  queryType?: SearchQueryType = SearchQueryType.SIMPLE;
}
