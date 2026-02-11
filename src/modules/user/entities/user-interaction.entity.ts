import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '@database/entities/base.entity';
import { UserEntity } from './user.entity';
import { InteractionType } from '@common/enums/interaction-type.enum';

@Entity('user_interactions')
@Index(['actorId', 'targetId'], { unique: true })
export class UserInteractionEntity extends BaseEntity {
    @Column({ name: 'actor_id' })
    actorId: string;

    @Column({ name: 'target_id' })
    targetId: string;

    @Column({
        type: 'enum',
        enum: InteractionType,
    })
    type: InteractionType;

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'actor_id' })
    actor: UserEntity;

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'target_id' })
    target: UserEntity;
}
