import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntityWithoutSoftDelete } from '@database/entities/base.entity';
import { DraftProfileEntity } from './draft-profile.entity';

/**
 * Draft Photo Entity
 *
 * Photos uploaded during the registration flow.
 * These are moved to the user_photos table when registration is completed.
 */
@Entity('draft_photos')
export class DraftPhotoEntity extends BaseEntityWithoutSoftDelete {
  @Column({ name: 'draft_id', type: 'uuid' })
  draftId: string;

  @ManyToOne(() => DraftProfileEntity, draft => draft.photos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'draft_id' })
  draft: DraftProfileEntity;

  @Column({ name: 'photo_url', type: 'varchar', length: 500 })
  photoUrl: string;

  @Column({ name: 'photo_order', type: 'integer' })
  photoOrder: number;
}
