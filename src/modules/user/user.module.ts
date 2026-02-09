import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { UserRepository } from './repositories/user.repository';
import { UserEntity } from './entities/user.entity';
import { UserPhotoEntity } from './entities/user-photo.entity';

/**
 * User Module
 *
 * Domain module handling all user-related operations.
 * Follows clean architecture with:
 * - Thin controller
 * - Business logic in service
 * - Data access in repository
 * - Entity for database mapping
 * - DTOs for input/output validation
 */
@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UserPhotoEntity])],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
