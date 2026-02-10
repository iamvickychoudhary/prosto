import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

// Core modules
import { CoreModule } from '@core/core.module';
import { AppConfigModule } from '@config/config.module';
import { DatabaseModule } from '@database/database.module';

// Feature modules
import { AuthModule } from '@modules/auth/auth.module';
import { UserModule } from '@modules/user/user.module';
import { DraftModule } from '@modules/draft/draft.module';
import { ProfileModule } from '@modules/profile/profile.module';
import { EmailModule } from '@modules/email/email.module';
import { SearchModule } from '@modules/search/search.module';
import { AiModule } from '@modules/ai/ai.module';
import { QueueModule } from '@modules/queue/queue.module';

// Common module
import { CommonModule } from '@common/common.module';

// Middleware
import { RequestIdMiddleware } from '@core/middleware/request-id.middleware';

@Module({
  imports: [
    // Configuration must be first
    AppConfigModule,

    // Core module with global filters, pipes, interceptors
    CoreModule,

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 100,
      },
      {
        name: 'strict',
        ttl: 60000,
        limit: 10,
      },
    ]),

    // Database connection
    DatabaseModule,

    // Common utilities
    CommonModule,

    // Feature modules
    AuthModule,
    UserModule,
    DraftModule,
    ProfileModule,
    EmailModule,
    SearchModule,
    AiModule,
    QueueModule,
  ],
  providers: [
    /* DISABLE RATE LIMITING
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    */
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
