import { Module, OnModuleInit, OnModuleDestroy, forwardRef } from '@nestjs/common';
import { QueueService } from './services/queue.service';
import { RabbitMQProvider } from './providers/rabbitmq.provider';
import { EmailProcessor } from './processors/email.processor';
import { SearchIndexProcessor } from './processors/search-index.processor';
import { EmailModule } from '@modules/email/email.module';
import { SearchModule } from '@modules/search/search.module';

/**
 * Queue Module
 *
 * Provides background job processing with RabbitMQ.
 * Features:
 * - Job queuing
 * - Delayed jobs
 * - Retry handling
 * - Dead letter queue
 * - Multiple processors
 */
@Module({
  imports: [EmailModule, forwardRef(() => SearchModule)],
  providers: [QueueService, RabbitMQProvider, EmailProcessor, SearchIndexProcessor],
  exports: [QueueService],
})
export class QueueModule implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly rabbitMQ: RabbitMQProvider) {}

  async onModuleInit(): Promise<void> {
    await this.rabbitMQ.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.rabbitMQ.disconnect();
  }
}
