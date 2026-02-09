import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { DraftProfileEntity } from '../entities/draft-profile.entity';
import { DraftPhotoEntity } from '../entities/draft-photo.entity';

/**
 * Draft Profile Repository
 */
@Injectable()
export class DraftProfileRepository extends Repository<DraftProfileEntity> {
  constructor(private dataSource: DataSource) {
    super(DraftProfileEntity, dataSource.createEntityManager());
  }

  /**
   * Find draft by email
   */
  async findByEmail(email: string): Promise<DraftProfileEntity | null> {
    return this.findOne({
      where: { email: email.toLowerCase() },
      relations: ['photos'],
    });
  }

  /**
   * Find non-expired draft by ID
   */
  async findActiveById(id: string): Promise<DraftProfileEntity | null> {
    return this.createQueryBuilder('draft')
      .leftJoinAndSelect('draft.photos', 'photos')
      .where('draft.id = :id', { id })
      .andWhere('draft.status = :status', { status: 'draft' })
      .andWhere('draft.expiresAt > NOW()')
      .orderBy('photos.photoOrder', 'ASC')
      .getOne();
  }

  /**
   * Create draft profile
   */
  async createDraft(email: string): Promise<DraftProfileEntity> {
    const draft = this.create({
      email: email.toLowerCase(),
    });
    return this.save(draft);
  }
}

/**
 * Draft Photo Repository
 */
@Injectable()
export class DraftPhotoRepository extends Repository<DraftPhotoEntity> {
  constructor(private dataSource: DataSource) {
    super(DraftPhotoEntity, dataSource.createEntityManager());
  }

  /**
   * Find photos by draft ID
   */
  async findByDraftId(draftId: string): Promise<DraftPhotoEntity[]> {
    return this.find({
      where: { draftId },
      order: { photoOrder: 'ASC' },
    });
  }

  /**
   * Get next photo order for a draft
   */
  async getNextOrder(draftId: string): Promise<number> {
    const result = await this.createQueryBuilder('photo')
      .select('MAX(photo.photoOrder)', 'maxOrder')
      .where('photo.draftId = :draftId', { draftId })
      .getRawOne();

    return (result?.maxOrder ?? -1) + 1;
  }

  /**
   * Count photos for a draft
   */
  async countByDraftId(draftId: string): Promise<number> {
    return this.count({ where: { draftId } });
  }
}
