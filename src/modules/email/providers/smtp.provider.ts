import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { AppConfigService } from '@config/app-config.service';
import {
  IEmailProvider,
  ISendEmailOptions,
  IEmailResult,
} from '../interfaces/email-provider.interface';

/**
 * SMTP Email Provider
 *
 * Sends emails via SMTP using Nodemailer.
 */
@Injectable()
export class SmtpProvider implements IEmailProvider {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: AppConfigService) {
    const config = this.configService.emailConfig;

    this.transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.password,
      },
    });
  }

  async send(options: ISendEmailOptions): Promise<IEmailResult> {
    const config = this.configService.emailConfig;

    try {
      // Build HTML content from template if needed
      let html = options.html;
      if (options.template && options.context) {
        html = this.renderTemplate(options.template, options.context);
      }

      const mailOptions: nodemailer.SendMailOptions = {
        from: `"${config.fromName}" <${config.from}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html,
        cc: options.cc,
        bcc: options.bcc,
        replyTo: options.replyTo,
        attachments: options.attachments?.map(att => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType,
        })),
      };

      const result = await this.transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: result.messageId,
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
   * In production, use a proper templating engine like Handlebars
   */
  private renderTemplate(template: string, context: Record<string, unknown>): string {
    // This is a simplified template renderer
    // In production, load templates from files and use a proper engine
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
        <p>This link expires in 1 hour.</p>
      `,
      'email-verification': `
        <h1>Verify Your Email</h1>
        <p>Hi {{name}},</p>
        <p>Click the link below to verify your email:</p>
        <a href="{{verificationUrl}}">Verify Email</a>
      `,
    };

    let html = templates[template] || `<p>${JSON.stringify(context)}</p>`;

    // Replace placeholders
    for (const [key, value] of Object.entries(context)) {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }

    return html;
  }
}
