import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { BaseRepository } from '@database/repositories/base.repository';
import { UserRole } from '@common/enums/user-role.enum';
import { UserStatus } from '@common/enums/user-status.enum';

/**
 * User Repository
 *
 * Extends BaseRepository with user-specific queries.
 * All database operations for users go through this repository.
 */
@Injectable()
export class UserRepository extends BaseRepository<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {
    super(userRepository);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.repository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  /**
   * Find user by phone
   */
  async findByPhone(countryCode: string, phone: string): Promise<UserEntity | null> {
    return this.repository.findOne({
      where: { countryCode, phone },
    });
  }

  /**
   * Find users by role
   */
  async findByRole(role: UserRole): Promise<UserEntity[]> {
    return this.repository.find({
      where: { role },
    });
  }

  /**
   * Search users by name or email
   */
  async search(query: string): Promise<UserEntity[]> {
    return this.repository
      .createQueryBuilder('user')
      .where('user.email ILIKE :query', { query: `%${query}%` })
      .orWhere('user.firstName ILIKE :query', { query: `%${query}%` })
      .orWhere('user.lastName ILIKE :query', { query: `%${query}%` })
      .orderBy('user.createdAt', 'DESC')
      .limit(50)
      .getMany();
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(userId: string): Promise<void> {
    await this.repository.update(userId, {
      lastLoginAt: new Date(),
    });
  }

  /**
   * Mark email as verified
   */
  async verifyEmail(userId: string): Promise<void> {
    await this.repository.update(userId, {
      emailVerified: true,
      emailVerifiedAt: new Date(),
    });
  }

  /**
   * Get user statistics
   */
  async getStatistics(): Promise<{
    total: number;
    active: number;
    verified: number;
  }> {
    const total = await this.repository.count();
    const active = await this.repository.count({
      where: { status: UserStatus.ACTIVE },
    });
    const verified = await this.repository.count({
      where: { emailVerified: true },
    });

    return { total, active, verified };
  }
}
