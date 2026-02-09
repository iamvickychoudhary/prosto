import {
  Repository,
  FindOptionsWhere,
  FindManyOptions,
  DeepPartial,
  ObjectLiteral,
  QueryDeepPartialEntity,
} from 'typeorm';
import { PaginationDto, PaginatedResult } from '@common/dto/pagination.dto';

/**
 * Base Repository
 *
 * Abstract repository providing common CRUD operations
 * and pagination support for all entities.
 *
 * Features:
 * - Generic type support
 * - Pagination helpers
 * - Soft delete support
 * - Common query patterns
 */
export abstract class BaseRepository<T extends ObjectLiteral> {
  constructor(protected readonly repository: Repository<T>) {}

  /**
   * Find entity by ID
   */
  async findById(id: string | number): Promise<T | null> {
    return this.repository.findOne({
      where: { id } as unknown as FindOptionsWhere<T>,
    });
  }

  /**
   * Find entity by ID or throw
   */
  async findByIdOrFail(id: string | number): Promise<T> {
    const entity = await this.findById(id);
    if (!entity) {
      throw new Error(`Entity with id ${id} not found`);
    }
    return entity;
  }

  /**
   * Find one entity by conditions
   */
  async findOne(where: FindOptionsWhere<T>): Promise<T | null> {
    return this.repository.findOne({ where });
  }

  /**
   * Find all entities matching conditions
   */
  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find(options);
  }

  /**
   * Find with pagination
   */
  async findPaginated(
    pagination: PaginationDto,
    where?: FindOptionsWhere<T>,
    options?: Omit<FindManyOptions<T>, 'where' | 'skip' | 'take'>,
  ): Promise<PaginatedResult<T>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [items, total] = await this.repository.findAndCount({
      ...options,
      where,
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }

  /**
   * Create new entity
   */
  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  /**
   * Create multiple entities
   */
  async createMany(data: DeepPartial<T>[]): Promise<T[]> {
    const entities = this.repository.create(data);
    return this.repository.save(entities);
  }

  /**
   * Update entity by ID
   */
  async update(id: string | number, data: DeepPartial<T>): Promise<T | null> {
    await this.repository.update(id, data as QueryDeepPartialEntity<T>);
    return this.findById(id);
  }

  /**
   * Delete entity by ID (hard delete)
   */
  async delete(id: string | number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }

  /**
   * Soft delete entity by ID
   */
  async softDelete(id: string | number): Promise<boolean> {
    const result = await this.repository.softDelete(id);
    return result.affected !== 0;
  }

  /**
   * Restore soft deleted entity
   */
  async restore(id: string | number): Promise<boolean> {
    const result = await this.repository.restore(id);
    return result.affected !== 0;
  }

  /**
   * Count entities matching conditions
   */
  async count(where?: FindOptionsWhere<T>): Promise<number> {
    return this.repository.count({ where });
  }

  /**
   * Check if entity exists
   */
  async exists(where: FindOptionsWhere<T>): Promise<boolean> {
    const count = await this.repository.count({ where });
    return count > 0;
  }
}
