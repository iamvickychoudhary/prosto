import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntityWithoutSoftDelete } from '@database/entities/base.entity';
import { UserEntity } from './user.entity';

/**
 * User Photo Entity
 *
 * Photos associated with a user's profile.
 */
@Entity('user_photos')
export class UserPhotoEntity extends BaseEntityWithoutSoftDelete {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity, user => user.photos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'photo_url', type: 'varchar', length: 500 })
  photoUrl: string;

  @Column({ name: 'photo_order', type: 'integer' })
  photoOrder: number;

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary: boolean;
}
