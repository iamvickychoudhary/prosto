import { Injectable } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import { AppConfigService } from '@config/app-config.service';
import {
  IEmailProvider,
  ISendEmailOptions,
  IEmailResult,
} from '../interfaces/email-provider.interface';

/**
 * SendGrid Email Provider
 *
 * Sends emails via SendGrid API.
 */
@Injectable()
export class SendGridProvider implements IEmailProvider {
  constructor(private readonly configService: AppConfigService) {
    const apiKey = this.configService.emailConfig.sendgrid.apiKey;
    if (apiKey) {
      sgMail.setApiKey(apiKey);
    }
  }

  async send(options: ISendEmailOptions): Promise<IEmailResult> {
    const config = this.configService.emailConfig;

    try {
      // Build HTML content from template if needed
      let html = options.html;
      if (options.template && options.context) {
        html = this.renderTemplate(options.template, options.context);
      }

      const msg: sgMail.MailDataRequired = {
        to: options.to,
        from: {
          email: config.from,
          name: config.fromName,
        },
        subject: options.subject,
        text: options.text || '',
        html: html || '',
        cc: options.cc,
        bcc: options.bcc,
        replyTo: options.replyTo,
        attachments: options.attachments?.map(att => ({
          filename: att.filename,
          content: typeof att.content === 'string' ? att.content : att.content.toString('base64'),
          type: att.contentType,
          disposition: 'attachment' as const,
        })),
      };

      const [response] = await sgMail.send(msg);

      return {
        success: true,
        messageId: response.headers['x-message-id'],
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Simple template rendering
   */
  private renderTemplate(template: string, context: Record<string, unknown>): string {
    const templates: Record<string, string> = {
      welcome: `
        <h1>Welcome, {{name}}!</h1>
        <p>Thank you for joining our platform.</p>
      `,
      'password-reset': `
        <h1>Password Reset Request</h1>
        <p>Hi {{name}},</p>
        <p>Click the link below to reset your password:</p>
        <a href="{{resetUrl}}">Reset Password</a>
      `,
      'email-verification': `
        <h1>Verify Your Email</h1>
        <p>Hi {{name}},</p>
        <p>Click the link below to verify your email:</p>
        <a href="{{verificationUrl}}">Verify Email</a>
      `,
    };

    let html = templates[template] || '';

    for (const [key, value] of Object.entries(context)) {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }

    return html;
  }
}
