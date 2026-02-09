import { Injectable } from '@nestjs/common';
import { RabbitMQProvider } from '../providers/rabbitmq.provider';
import { IJobOptions, IJobData } from '../interfaces/queue.interface';
import { WinstonLoggerService } from '@core/logging/winston-logger.service';
import { QUEUE_NAMES } from '@common/constants/app.constants';

/**
 * Queue Service
 *
 * High-level queue service that provides job management.
 */
@Injectable()
export class QueueService {
  constructor(
    private readonly rabbitMQ: RabbitMQProvider,
    private readonly logger: WinstonLoggerService,
  ) {
    this.logger.setContext('QueueService');
  }

  /**
   * Add a job to a queue
   */
  async addJob<T>(
    queueName: string,
    type: string,
    data: T,
    options?: IJobOptions,
  ): Promise<string> {
    return this.rabbitMQ.addJob(queueName, type, data, options);
  }

  /**
   * Add email job
   */
  async addEmailJob(data: {
    to: string;
    subject: string;
    template: string;
    context: Record<string, unknown>;
  }): Promise<string> {
    return this.addJob(QUEUE_NAMES.EMAIL, 'send-email', data);
  }

  /**
   * Add search indexing job
   */
  async addSearchIndexJob(data: {
    indexName: string;
    action: 'index' | 'update' | 'delete';
    documents: Array<{ id: string; [key: string]: unknown }>;
  }): Promise<string> {
    return this.addJob(QUEUE_NAMES.SEARCH_INDEXING, 'index-documents', data);
  }

  /**
   * Add AI processing job
   */
  async addAIProcessingJob(data: {
    type: string;
    input: string;
    options?: Record<string, unknown>;
  }): Promise<string> {
    return this.addJob(QUEUE_NAMES.AI_PROCESSING, 'process', data);
  }

  /**
   * Add notification job
   */
  async addNotificationJob(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: Record<string, unknown>;
  }): Promise<string> {
    return this.addJob(QUEUE_NAMES.NOTIFICATION, 'send-notification', data);
  }

  /**
   * Add delayed job
   */
  async addDelayedJob<T>(
    queueName: string,
    type: string,
    data: T,
    delayMs: number,
    options?: Omit<IJobOptions, 'delay'>,
  ): Promise<string> {
    return this.addJob(queueName, type, data, {
      ...options,
      delay: delayMs,
    });
  }

  /**
   * Register a processor for a queue
   */
  async registerProcessor<T>(
    queueName: string,
    processor: (job: IJobData<T>) => Promise<unknown>,
  ): Promise<void> {
    return this.rabbitMQ.registerProcessor(queueName, processor);
  }

  /**
   * Get queue message count
   */
  async getQueueCount(queueName: string): Promise<number> {
    return this.rabbitMQ.getQueueCount(queueName);
  }

  /**
   * Purge a queue
   */
  async purgeQueue(queueName: string): Promise<number> {
    return this.rabbitMQ.purgeQueue(queueName);
  }

  /**
   * Check if queue service is healthy
   */
  isHealthy(): boolean {
    return this.rabbitMQ.isConnected();
  }
}
