import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { UserEntity } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { SimpleUserDto } from '../dto/simple-user.dto';
import { PaginationDto, PaginatedResult } from '@common/dto/pagination.dto';
import {
  EntityNotFoundException,
  EntityAlreadyExistsException,
} from '@core/exceptions/business.exception';

/**
 * User Service
 *
 * Contains all business logic for user operations.
 * Orchestrates between repository and external services.
 */
@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) { }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<UserEntity | null> {
    return this.userRepository.findById(id);
  }

  /**
   * Find user by ID or throw exception
   */
  async findByIdOrFail(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new EntityNotFoundException('User', id);
    }
    return user;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findByEmail(email);
  }

  /**
   * Find user by phone
   */
  async findByPhone(countryCode: string, phone: string): Promise<UserEntity | null> {
    return this.userRepository.findByPhone(countryCode, phone);
  }

  /**
   * Create new user
   */
  async create(dto: CreateUserDto): Promise<UserEntity> {
    // Check for existing email
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new EntityAlreadyExistsException('User', 'email');
    }

    return this.userRepository.create({
      ...dto,
      email: dto.email.toLowerCase(),
    });
  }

  /**
   * Update user
   */
  async update(id: string, dto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.findByIdOrFail(id);

    // Check email uniqueness if changing email
    if (dto.email && dto.email.toLowerCase() !== user.email) {
      const existing = await this.userRepository.findByEmail(dto.email);
      if (existing) {
        throw new EntityAlreadyExistsException('User', 'email');
      }
    }

    const updated = await this.userRepository.update(id, {
      ...dto,
      email: dto.email?.toLowerCase(),
    });

    return updated!;
  }

  /**
   * Delete user (soft delete)
   */
  async delete(id: string): Promise<void> {
    await this.findByIdOrFail(id);
    await this.userRepository.softDelete(id);
  }

  /**
   * Get paginated users
   */
  async findAll(pagination: PaginationDto): Promise<PaginatedResult<UserResponseDto>> {
    const result = await this.userRepository.findPaginated(pagination);

    return {
      ...result,
      items: result.items.map(user => this.toResponseDto(user)),
    };
  }

  /**
   * Search users
   */
  async search(query: string): Promise<UserResponseDto[]> {
    const users = await this.userRepository.search(query);
    return users.map(user => this.toResponseDto(user));
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(userId: string): Promise<void> {
    await this.userRepository.updateLastLogin(userId);
  }

  /**
   * Verify user email
   */
  async verifyEmail(userId: string): Promise<void> {
    await this.findByIdOrFail(userId);
    await this.userRepository.verifyEmail(userId);
  }

  /**
   * Get user statistics
   */
  async getStatistics() {
    return this.userRepository.getStatistics();
  }

  /**
   * Get available users (for stack/feed)
   */
  async getList(currentUserId: string, limit: number = 20): Promise<SimpleUserDto[]> {
    const users = await this.userRepository.findAvailableUsers(currentUserId, limit);

    return users.map(user => {
      let avatarUrl = user.avatarUrl;

      if (user.photos && user.photos.length > 0) {
        // 1. Try to find primary photo
        const primaryPhoto = user.photos.find(p => p.isPrimary);
        if (primaryPhoto) {
          avatarUrl = primaryPhoto.photoUrl;
        } else {
          // 2. Try to find photo with order 0
          const orderZeroPhoto = user.photos.find(p => p.photoOrder === 0);
          if (orderZeroPhoto) {
            avatarUrl = orderZeroPhoto.photoUrl;
          } else {
            // 3. Fallback to first photo by order
            // Create a copy to sort to avoid mutating original array
            const sortedPhotos = [...user.photos].sort((a, b) => a.photoOrder - b.photoOrder);
            avatarUrl = sortedPhotos[0].photoUrl;
          }
        }
      }

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        avatarUrl,
        age: user.age ?? undefined, // Handle null vs undefined
        gender: user.gender,
      };
    });
  }

  /**
   * Transform entity to response DTO (excludes sensitive data)
   */
  private toResponseDto(user: UserEntity): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      status: user.status,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
