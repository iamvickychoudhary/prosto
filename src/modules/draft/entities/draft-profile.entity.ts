import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntityWithoutSoftDelete } from '@database/entities/base.entity';
import { Gender } from '@common/enums/gender.enum';
import { DraftStatus } from '@common/enums/draft-status.enum';
import { DraftPhotoEntity } from './draft-photo.entity';

/**
 * Draft Profile Entity
 *
 * Temporary storage for user profiles during the multi-step registration flow.
 * Draft profiles expire after 24 hours if not completed.
 */
@Entity('draft_profiles')
export class DraftProfileEntity extends BaseEntityWithoutSoftDelete {
  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  email: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100, nullable: true })
  firstName?: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude?: number;

  @Column({ name: 'location_skipped', type: 'boolean', default: false })
  locationSkipped: boolean;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender?: Gender;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  seeking?: Gender;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({ name: 'rules_accepted', type: 'boolean', default: false })
  rulesAccepted: boolean;

  @Column({
    type: 'enum',
    enum: DraftStatus,
    default: DraftStatus.DRAFT,
  })
  status: DraftStatus;

  @Column({
    name: 'expires_at',
    type: 'timestamp with time zone',
    default: () => "CURRENT_TIMESTAMP + INTERVAL '24 hours'",
  })
  expiresAt: Date;

  @OneToMany(() => DraftPhotoEntity, photo => photo.draft, {
    cascade: true,
    eager: true,
  })
  photos: DraftPhotoEntity[];

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
