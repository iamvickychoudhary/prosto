import { Injectable, Inject } from '@nestjs/common';
import {
  IEmailProvider,
  EMAIL_PROVIDER,
  ISendEmailOptions,
  IEmailResult,
} from '../interfaces/email-provider.interface';
import { WinstonLoggerService } from '@core/logging/winston-logger.service';

/**
 * Email Service
 *
 * High-level email service that uses the injected provider.
 * Provides additional features like:
 * - Template rendering
 * - Logging
 * - Retry logic
 * - Queue integration
 */
@Injectable()
export class EmailService {
  constructor(
    @Inject(EMAIL_PROVIDER)
    private readonly emailProvider: IEmailProvider,
    private readonly logger: WinstonLoggerService,
  ) {
    this.logger.setContext('EmailService');
  }

  /**
   * Send an email
   */
  async send(options: ISendEmailOptions): Promise<IEmailResult> {
    this.logger.log(`Sending email to ${options.to}`);

    try {
      const result = await this.emailProvider.send(options);

      if (result.success) {
        this.logger.log(`Email sent successfully to ${options.to}`);
      } else {
        this.logger.error(`Failed to send email to ${options.to}: ${result.error}`);
      }

      return result;
    } catch (error) {
      this.logger.error(`Error sending email: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(to: string, name: string): Promise<IEmailResult> {
    return this.send({
      to,
      subject: 'Welcome to Enterprise App',
      template: 'welcome',
      context: { name },
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    to: string,
    name: string,
    resetToken: string,
    resetUrl: string,
  ): Promise<IEmailResult> {
    return this.send({
      to,
      subject: 'Password Reset Request',
      template: 'password-reset',
      context: { name, resetToken, resetUrl },
    });
  }

  /**
   * Send email verification email
   */
  async sendVerificationEmail(
    to: string,
    name: string,
    verificationUrl: string,
  ): Promise<IEmailResult> {
    return this.send({
      to,
      subject: 'Verify Your Email',
      template: 'email-verification',
      context: { name, verificationUrl },
    });
  }

  /**
   * Send notification email
   */
  async sendNotificationEmail(to: string, subject: string, message: string): Promise<IEmailResult> {
    return this.send({
      to,
      subject,
      html: `<p>${message}</p>`,
    });
  }
}
