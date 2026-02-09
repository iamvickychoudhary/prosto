import { Module } from '@nestjs/common';
import { EmailService } from './services/email.service';
import { SmtpProvider } from './providers/smtp.provider';
import { SendGridProvider } from './providers/sendgrid.provider';
import { EMAIL_PROVIDER } from './interfaces/email-provider.interface';
import { AppConfigService } from '@config/app-config.service';

/**
 * Email Module
 *
 * Provides email sending capabilities with multiple provider support.
 * Uses the Strategy pattern for provider switching.
 *
 * Supported providers:
 * - SMTP (Nodemailer)
 * - SendGrid
 *
 * Provider is selected based on configuration.
 */
@Module({
  providers: [
    EmailService,
    SmtpProvider,
    SendGridProvider,
    {
      provide: EMAIL_PROVIDER,
      useFactory: (
        configService: AppConfigService,
        smtp: SmtpProvider,
        sendgrid: SendGridProvider,
      ) => {
        // Use SendGrid if API key is configured, otherwise use SMTP
        const sendgridConfig = configService.emailConfig.sendgrid;
        if (sendgridConfig.apiKey) {
          return sendgrid;
        }
        return smtp;
      },
      inject: [AppConfigService, SmtpProvider, SendGridProvider],
    },
  ],
  exports: [EmailService],
})
export class EmailModule {}
