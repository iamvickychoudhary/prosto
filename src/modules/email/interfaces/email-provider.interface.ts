/**
 * Email Provider Interface
 *
 * Defines the contract for email provider implementations.
 * All email providers must implement this interface.
 */
export interface IEmailProvider {
  /**
   * Send an email
   */
  send(options: ISendEmailOptions): Promise<IEmailResult>;
}

/**
 * Email sending options
 */
export interface ISendEmailOptions {
  /** Recipient email address */
  to: string | string[];

  /** Email subject */
  subject: string;

  /** Plain text content */
  text?: string;

  /** HTML content */
  html?: string;

  /** Template name */
  template?: string;

  /** Template context/variables */
  context?: Record<string, unknown>;

  /** CC recipients */
  cc?: string | string[];

  /** BCC recipients */
  bcc?: string | string[];

  /** Attachments */
  attachments?: IEmailAttachment[];

  /** Reply-to address */
  replyTo?: string;
}

/**
 * Email attachment
 */
export interface IEmailAttachment {
  /** Attachment filename */
  filename: string;

  /** File content (Buffer or path) */
  content: Buffer | string;

  /** MIME type */
  contentType?: string;
}

/**
 * Email sending result
 */
export interface IEmailResult {
  /** Whether the email was sent successfully */
  success: boolean;

  /** Message ID from the provider */
  messageId?: string;

  /** Error message if failed */
  error?: string;
}

/**
 * Injection token for email provider
 */
export const EMAIL_PROVIDER = Symbol('EMAIL_PROVIDER');
