import { Global, Module } from '@nestjs/common';

/**
 * Common Module
 *
 * Contains shared utilities, helpers, constants, and DTOs
 * used across the application. Marked as @Global for
 * easy access without explicit imports.
 */
@Global()
@Module({
  providers: [],
  exports: [],
})
export class CommonModule {}
