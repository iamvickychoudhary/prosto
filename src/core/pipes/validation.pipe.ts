import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

/**
 * Zod Validation Pipe
 *
 * Custom validation pipe using Zod for schema validation.
 * Use this when you need Zod's powerful schema validation
 * instead of class-validator decorators.
 *
 * Usage:
 * @UsePipes(new ZodValidationPipe(YourZodSchema))
 * @Post()
 * async create(@Body() dto: YourDto) { ... }
 */
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata): unknown {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        throw new BadRequestException({
          message: 'Validation failed',
          errors: formattedErrors,
        });
      }
      throw error;
    }
  }
}

/**
 * Parse Int Pipe with custom error message
 */
@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException(`${metadata.data || 'Parameter'} must be a valid integer`);
    }
    return val;
  }
}

/**
 * Parse UUID Pipe
 */
@Injectable()
export class ParseUUIDPipe implements PipeTransform<string> {
  private readonly uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  transform(value: string, metadata: ArgumentMetadata): string {
    if (!this.uuidRegex.test(value)) {
      throw new BadRequestException(`${metadata.data || 'Parameter'} must be a valid UUID`);
    }
    return value;
  }
}
