import { Entity, Column, Index, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

/**
 * OTP Entity
 *
 * Stores one-time passwords for authentication.
 */
@Entity('otps')
export class OtpEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index()
  email?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  @Index()
  phone?: string;

  @Column({ name: 'country_code', type: 'varchar', length: 10, nullable: true })
  countryCode?: string;

  @Column({ type: 'varchar', length: 6, default: '000000' })
  code: string;

  @Column({ name: 'expires_at', type: 'timestamp with time zone' })
  expiresAt: Date;

  @Column({ type: 'boolean', default: false })
  used: boolean;

  @Column({ type: 'integer', default: 0 })
  attempts: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
  })
  createdAt: Date;

  /**
   * Check if OTP is expired
   */
  get isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  /**
   * Check if OTP is valid (not expired and not used)
   */
  get isValid(): boolean {
    return !this.isExpired && !this.used;
  }
}
