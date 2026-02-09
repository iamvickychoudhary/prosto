import { Injectable, OnModuleInit } from '@nestjs/common';
import { QueueService } from '../services/queue.service';
import { IJobData } from '../interfaces/queue.interface';
import { EmailService } from '@modules/email/services/email.service';
import { WinstonLoggerService } from '@core/logging/winston-logger.service';
import { QUEUE_NAMES } from '@common/constants/app.constants';

/**
 * Email Job Data
 */
interface EmailJobData {
  to: string;
  subject: string;
  template?: string;
  html?: string;
  context?: Record<string, unknown>;
}

/**
 * Email Processor
 *
 * Processes email jobs from the queue.
 */
@Injectable()
export class EmailProcessor implements OnModuleInit {
  constructor(
    private readonly queueService: QueueService,
    private readonly emailService: EmailService,
    private readonly logger: WinstonLoggerService,
  ) {
    this.logger.setContext('EmailProcessor');
  }

  async onModuleInit(): Promise<void> {
    // Register processor when module initializes
    try {
      await this.queueService.registerProcessor<EmailJobData>(
        QUEUE_NAMES.EMAIL,
        this.process.bind(this),
      );
      this.logger.log('Email processor registered');
    } catch (error) {
      this.logger.warn(`Failed to register email processor: ${error.message}`);
    }
  }

  /**
   * Process email job
   */
  async process(job: IJobData<EmailJobData>): Promise<void> {
    const { to, subject, template, html, context } = job.data;

    this.logger.debug(`Processing email job ${job.id} to ${to}`);

    const result = await this.emailService.send({
      to,
      subject,
      template,
      html,
      context,
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to send email');
    }

    this.logger.log(`Email sent successfully to ${to}`);
  }
}
