import { Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';
import { AppConfigService } from '@config/app-config.service';
import { WinstonLoggerService } from '@core/logging/winston-logger.service';
import { IJobData, IJobOptions } from '../interfaces/queue.interface';
import { v4 as uuidv4 } from 'uuid';

/**
 * RabbitMQ Provider
 *
 * Provides RabbitMQ connection and queue operations.
 */
@Injectable()
export class RabbitMQProvider {
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;
  private readonly queuePrefix: string;
  private readonly processors: Map<string, (data: unknown) => Promise<unknown>> = new Map();

  constructor(
    private readonly configService: AppConfigService,
    private readonly logger: WinstonLoggerService,
  ) {
    this.logger.setContext('RabbitMQProvider');
    this.queuePrefix = this.configService.rabbitMQConfig.queuePrefix;
  }

  /**
   * Connect to RabbitMQ
   */
  async connect(): Promise<void> {
    const url = this.configService.rabbitMQConfig.url;

    if (!url) {
      this.logger.warn('RabbitMQ URL not configured - queue functionality unavailable');
      return;
    }

    try {
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();

      // Set prefetch to process one message at a time
      await this.channel.prefetch(1);

      this.logger.log('Connected to RabbitMQ');

      // Handle connection errors
      this.connection.on('error', err => {
        this.logger.error(`RabbitMQ connection error: ${err.message}`);
      });

      this.connection.on('close', () => {
        this.logger.warn('RabbitMQ connection closed');
        this.reconnect();
      });
    } catch (error) {
      this.logger.error(`Failed to connect to RabbitMQ: ${error.message}`);
    }
  }

  /**
   * Reconnect to RabbitMQ
   */
  private async reconnect(): Promise<void> {
    this.logger.log('Attempting to reconnect to RabbitMQ...');
    setTimeout(() => this.connect(), 5000);
  }

  /**
   * Disconnect from RabbitMQ
   */
  async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      this.logger.log('Disconnected from RabbitMQ');
    } catch (error) {
      this.logger.error(`Error disconnecting from RabbitMQ: ${error.message}`);
    }
  }

  /**
   * Get full queue name with prefix
   */
  private getQueueName(name: string): string {
    return `${this.queuePrefix}.${name}`;
  }

  /**
   * Get dead letter queue name
   */
  private getDeadLetterQueueName(name: string): string {
    return `${this.getQueueName(name)}.dlq`;
  }

  /**
   * Ensure queue exists with proper configuration
   */
  async ensureQueue(name: string): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not available');
    }

    const queueName = this.getQueueName(name);
    const dlqName = this.getDeadLetterQueueName(name);

    // Create dead letter queue
    await this.channel.assertQueue(dlqName, {
      durable: true,
    });

    // Create main queue with dead letter exchange
    await this.channel.assertQueue(queueName, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': '',
        'x-dead-letter-routing-key': dlqName,
      },
    });
  }

  /**
   * Add a job to the queue
   */
  async addJob<T>(
    queueName: string,
    type: string,
    data: T,
    options?: IJobOptions,
  ): Promise<string> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not available');
    }

    await this.ensureQueue(queueName);

    const jobId = uuidv4();
    const job: IJobData<T> = {
      id: jobId,
      type,
      data,
      options,
      createdAt: new Date(),
      attempts: 0,
    };

    const messageOptions: amqp.Options.Publish = {
      persistent: true,
      messageId: jobId,
      timestamp: Date.now(),
      headers: {
        'x-max-retries': options?.maxRetries || 3,
        'x-retry-delay': options?.retryDelay || 5000,
      },
    };

    // Handle delayed messages
    if (options?.delay && options.delay > 0) {
      const delayQueueName = `${this.getQueueName(queueName)}.delay.${options.delay}`;

      await this.channel.assertQueue(delayQueueName, {
        durable: true,
        arguments: {
          'x-message-ttl': options.delay,
          'x-dead-letter-exchange': '',
          'x-dead-letter-routing-key': this.getQueueName(queueName),
        },
      });

      this.channel.sendToQueue(delayQueueName, Buffer.from(JSON.stringify(job)), messageOptions);
    } else {
      this.channel.sendToQueue(
        this.getQueueName(queueName),
        Buffer.from(JSON.stringify(job)),
        messageOptions,
      );
    }

    this.logger.debug(`Job ${jobId} added to queue ${queueName}`);
    return jobId;
  }

  /**
   * Register a processor for a queue
   */
  async registerProcessor<T>(
    queueName: string,
    processor: (job: IJobData<T>) => Promise<unknown>,
  ): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not available');
    }

    await this.ensureQueue(queueName);

    const fullQueueName = this.getQueueName(queueName);
    this.processors.set(fullQueueName, processor as (data: unknown) => Promise<unknown>);

    await this.channel.consume(fullQueueName, async msg => {
      if (!msg || !this.channel) return;

      const startTime = Date.now();
      let job: IJobData<T>;

      try {
        job = JSON.parse(msg.content.toString());
        job.attempts++;

        this.logger.debug(`Processing job ${job.id} (attempt ${job.attempts})`);

        await processor(job);

        this.channel.ack(msg);
        this.logger.debug(`Job ${job.id} completed in ${Date.now() - startTime}ms`);
      } catch (error) {
        job = JSON.parse(msg.content.toString());
        const maxRetries = msg.properties.headers?.['x-max-retries'] || 3;
        const retryDelay = msg.properties.headers?.['x-retry-delay'] || 5000;

        if (job.attempts < maxRetries) {
          this.logger.warn(`Job ${job.id} failed, retrying in ${retryDelay}ms`);

          // Requeue with delay
          setTimeout(() => {
            this.channel?.nack(msg, false, true);
          }, retryDelay);
        } else {
          this.logger.error(`Job ${job.id} failed permanently: ${error.message}`);
          // Send to dead letter queue
          this.channel.nack(msg, false, false);
        }
      }
    });

    this.logger.log(`Processor registered for queue: ${queueName}`);
  }

  /**
   * Get queue message count
   */
  async getQueueCount(queueName: string): Promise<number> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not available');
    }

    const result = await this.channel.checkQueue(this.getQueueName(queueName));
    return result.messageCount;
  }

  /**
   * Purge a queue
   */
  async purgeQueue(queueName: string): Promise<number> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not available');
    }

    const result = await this.channel.purgeQueue(this.getQueueName(queueName));
    this.logger.log(`Purged ${result.messageCount} messages from queue ${queueName}`);
    return result.messageCount;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connection !== null && this.channel !== null;
  }
}
