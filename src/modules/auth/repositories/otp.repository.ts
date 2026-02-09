import { Injectable } from '@nestjs/common';
import { DataSource, Repository, LessThan } from 'typeorm';
import { OtpEntity } from '../entities/otp.entity';

const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;

/**
 * OTP Repository
 */
@Injectable()
export class OtpRepository extends Repository<OtpEntity> {
  constructor(private dataSource: DataSource) {
    super(OtpEntity, dataSource.createEntityManager());
  }

  /**
   * Generate a random OTP code
   */
  generateOtpCode(length: number = 6): string {
    const digits = '0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return code;
  }

  /**
   * Create OTP for email
   */
  async createForEmail(email: string): Promise<OtpEntity> {
    // Invalidate any existing OTPs for this email
    await this.update({ email: email.toLowerCase(), used: false }, { used: true });

    const otp = this.create({
      email: email.toLowerCase(),
      code: this.generateOtpCode(),
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
    });

    return this.save(otp);
  }

  /**
   * Create OTP for phone
   */
  async createForPhone(countryCode: string, phone: string): Promise<OtpEntity> {
    // Invalidate any existing OTPs for this phone
    await this.update({ phone, countryCode, used: false }, { used: true });

    const otp = this.create({
      countryCode,
      phone,
      code: this.generateOtpCode(),
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
    });

    return this.save(otp);
  }

  /**
   * Find valid OTP by email
   */
  async findValidByEmail(email: string): Promise<OtpEntity | null> {
    return this.findOne({
      where: {
        email: email.toLowerCase(),
        used: false,
      },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find valid OTP by phone
   */
  async findValidByPhone(countryCode: string, phone: string): Promise<OtpEntity | null> {
    return this.findOne({
      where: {
        countryCode,
        phone,
        used: false,
      },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Verify OTP code for email
   */
  async verifyByEmail(email: string, code: string): Promise<{ valid: boolean; error?: string }> {
    const otp = await this.findValidByEmail(email);

    if (!otp) {
      return { valid: false, error: 'OTP_NOT_FOUND' };
    }

    if (otp.isExpired) {
      return { valid: false, error: 'OTP_EXPIRED' };
    }

    if (otp.attempts >= MAX_ATTEMPTS) {
      return { valid: false, error: 'MAX_ATTEMPTS_EXCEEDED' };
    }

    if (otp.code !== code) {
      // Increment attempts
      await this.update(otp.id, { attempts: otp.attempts + 1 });
      return { valid: false, error: 'INVALID_OTP' };
    }

    // Mark as used
    await this.update(otp.id, { used: true });

    return { valid: true };
  }

  /**
   * Verify OTP code for phone
   */
  async verifyByPhone(
    countryCode: string,
    phone: string,
    code: string,
  ): Promise<{ valid: boolean; error?: string }> {
    const otp = await this.findValidByPhone(countryCode, phone);

    if (!otp) {
      return { valid: false, error: 'OTP_NOT_FOUND' };
    }

    if (otp.isExpired) {
      return { valid: false, error: 'OTP_EXPIRED' };
    }

    if (otp.attempts >= MAX_ATTEMPTS) {
      return { valid: false, error: 'MAX_ATTEMPTS_EXCEEDED' };
    }

    if (otp.code !== code) {
      // Increment attempts
      await this.update(otp.id, { attempts: otp.attempts + 1 });
      return { valid: false, error: 'INVALID_OTP' };
    }

    // Mark as used
    await this.update(otp.id, { used: true });

    return { valid: true };
  }

  /**
   * Clean up expired OTPs
   */
  async cleanupExpired(): Promise<number> {
    const result = await this.delete({
      expiresAt: LessThan(new Date()),
    });
    return result.affected ?? 0;
  }
}
