import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '@database/entities/base.entity';
import { UserRole } from '@common/enums/user-role.enum';
import { UserStatus } from '@common/enums/user-status.enum';
import { Gender } from '@common/enums/gender.enum';
import { UserPhotoEntity } from './user-photo.entity';

/**
 * User Entity
 *
 * Database representation of a user in the system.
 */
@Entity('users')
export class UserEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: true })
  lastName?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ name: 'country_code', type: 'varchar', length: 10, nullable: true })
  countryCode?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ name: 'avatar_url', type: 'varchar', length: 500, nullable: true })
  avatarUrl?: string;

  @Column({ name: 'last_login_at', type: 'timestamp with time zone', nullable: true })
  lastLoginAt?: Date;

  @Column({ name: 'email_verified', type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ name: 'email_verified_at', type: 'timestamp with time zone', nullable: true })
  emailVerifiedAt?: Date;

  // Dating app specific fields
  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender?: Gender;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  seeking?: Gender;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude?: number;

  @Column({ name: 'location_skipped', type: 'boolean', default: false })
  locationSkipped: boolean;

  @OneToMany(() => UserPhotoEntity, photo => photo.user, {
    cascade: true,
    eager: true,
  })
  photos: UserPhotoEntity[];

  /**
   * Virtual field for full name
   */
  get fullName(): string {
    return this.lastName ? `${this.firstName} ${this.lastName}` : this.firstName;
  }

  /**
   * Calculate age from date of birth
   */
  get age(): number | null {
    if (!this.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
}
