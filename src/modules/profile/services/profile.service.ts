import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { AppConfigService } from '@config/app-config.service';
import {
  DraftProfileRepository,
  DraftPhotoRepository,
} from '@modules/draft/repositories/draft.repository';
import { DraftProfileEntity } from '@modules/draft/entities/draft-profile.entity';
import { DraftPhotoEntity } from '@modules/draft/entities/draft-photo.entity';
import { DraftStatus, ErrorCode } from '@common/enums';
import { ErrorMessages, createErrorResponse } from '@common/constants/messages.constants';
import { UserEntity } from '@modules/user/entities/user.entity';
import { UserPhotoEntity } from '@modules/user/entities/user-photo.entity';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { CompleteProfileDto } from '../dto/complete-profile.dto';

const MIN_PHOTOS_REQUIRED = 2;
const MAX_PHOTOS_ALLOWED = 6;
const MIN_AGE = 18;

/**
 * Profile Service
 *
 * Handles profile updates during registration flow.
 */
@Injectable()
export class ProfileService {
  constructor(
    private readonly draftRepository: DraftProfileRepository,
    private readonly draftPhotoRepository: DraftPhotoRepository,
    private readonly jwtService: JwtService,
    private readonly configService: AppConfigService,
    private readonly dataSource: DataSource,
  ) { }

  /**
   * Update draft profile (Steps 2-6, 8)
   */
  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<DraftProfileEntity> {
    // Validate draft exists
    await this.getDraftOrFail(userId);

    return this.updateDraftProfile(userId, dto);
  }

  /**
   * Update draft profile (during registration)
   */
  private async updateDraftProfile(userId: string, dto: UpdateProfileDto): Promise<DraftProfileEntity> {
    // Build update object
    const updateData: Partial<DraftProfileEntity> = {};

    if (dto.first_name !== undefined) {
      updateData.firstName = dto.first_name;
    }

    if (dto.gender !== undefined) {
      updateData.gender = dto.gender;
    }

    if (dto.seeking !== undefined) {
      updateData.seeking = dto.seeking;
    }

    if (dto.date_of_birth !== undefined) {
      const dateOfBirth = new Date(dto.date_of_birth);
      const age = this.calculateAge(dateOfBirth);

      if (age < MIN_AGE) {
        throw new BadRequestException(createErrorResponse(ErrorCode.AGE_RESTRICTION));
      }

      updateData.dateOfBirth = dateOfBirth;
    }

    if (dto.latitude !== undefined && dto.longitude !== undefined) {
      updateData.latitude = dto.latitude;
      updateData.longitude = dto.longitude;
      updateData.locationSkipped = false;
    }

    if (dto.location_skipped === true) {
      updateData.locationSkipped = true;
      updateData.latitude = undefined;
      updateData.longitude = undefined;
    }

    if (dto.rules_accepted !== undefined) {
      updateData.rulesAccepted = dto.rules_accepted;
    }

    // Extended profile fields
    if (dto.about_me !== undefined) updateData.aboutMe = dto.about_me;
    if (dto.current_work !== undefined) updateData.currentWork = dto.current_work;
    if (dto.school !== undefined) updateData.school = dto.school;
    if (dto.looking_for !== undefined) updateData.lookingFor = dto.looking_for;
    if (dto.pets !== undefined) updateData.pets = dto.pets;
    if (dto.children !== undefined) updateData.children = dto.children;
    if (dto.astrological_sign !== undefined) updateData.astrologicalSign = dto.astrological_sign;
    if (dto.religion !== undefined) updateData.religion = dto.religion;
    if (dto.education !== undefined) updateData.education = dto.education;
    if (dto.height !== undefined) updateData.height = dto.height;
    if (dto.body_type !== undefined) updateData.bodyType = dto.body_type;
    if (dto.exercise !== undefined) updateData.exercise = dto.exercise;
    if (dto.drink !== undefined) updateData.drink = dto.drink;
    if (dto.smoker !== undefined) updateData.smoker = dto.smoker;
    if (dto.marijuana !== undefined) updateData.marijuana = dto.marijuana;

    // Update draft
    await this.draftRepository.update(userId, updateData);

    return this.getDraftOrFail(userId);
  }

  /**
   * Update existing user profile (after registration)
   */
  async updateUserProfile(
    userId: string,
    dto: UpdateProfileDto,
    files?: Array<Express.Multer.File>,
  ): Promise<UserEntity> {
    const userRepo = this.dataSource.getRepository(UserEntity);

    // Check if user exists
    const user = await userRepo.findOne({ where: { id: userId }, relations: ['photos'] });
    if (!user) {
      throw new NotFoundException(createErrorResponse(ErrorCode.USER_NOT_FOUND));
    }

    // Build update object
    const updateData: Partial<UserEntity> = {};

    if (dto.first_name !== undefined) updateData.firstName = dto.first_name;
    if (dto.gender !== undefined) updateData.gender = dto.gender;
    if (dto.seeking !== undefined) updateData.seeking = dto.seeking;

    if (dto.date_of_birth !== undefined) {
      const dateOfBirth = new Date(dto.date_of_birth);
      const age = this.calculateAge(dateOfBirth);
      if (age < MIN_AGE) {
        throw new BadRequestException(createErrorResponse(ErrorCode.AGE_RESTRICTION));
      }
      updateData.dateOfBirth = dateOfBirth;
    }

    if (dto.latitude !== undefined && dto.longitude !== undefined) {
      updateData.latitude = dto.latitude;
      updateData.longitude = dto.longitude;
      updateData.locationSkipped = false;
    }

    if (dto.location_skipped === true) {
      updateData.locationSkipped = true;
      updateData.latitude = undefined;
      updateData.longitude = undefined;
    }

    // Extended profile fields
    if (dto.about_me !== undefined) updateData.aboutMe = dto.about_me;
    if (dto.current_work !== undefined) updateData.currentWork = dto.current_work;
    if (dto.school !== undefined) updateData.school = dto.school;
    if (dto.looking_for !== undefined) updateData.lookingFor = dto.looking_for;
    if (dto.pets !== undefined) updateData.pets = dto.pets;
    if (dto.children !== undefined) updateData.children = dto.children;
    if (dto.astrological_sign !== undefined) updateData.astrologicalSign = dto.astrological_sign;
    if (dto.religion !== undefined) updateData.religion = dto.religion;
    if (dto.education !== undefined) updateData.education = dto.education;
    if (dto.height !== undefined) updateData.height = dto.height;
    if (dto.body_type !== undefined) updateData.bodyType = dto.body_type;
    if (dto.exercise !== undefined) updateData.exercise = dto.exercise;
    if (dto.drink !== undefined) updateData.drink = dto.drink;
    if (dto.smoker !== undefined) updateData.smoker = dto.smoker;
    if (dto.marijuana !== undefined) updateData.marijuana = dto.marijuana;

    // Update user
    await userRepo.update(userId, updateData);

    // Handle photo files upload if provided
    if (files && files.length > 0) {
      const userPhotoRepo = this.dataSource.getRepository(UserPhotoEntity);

      // Get current photo count
      const currentPhotoCount = await userPhotoRepo.count({ where: { userId } });

      // Check if adding new photos would exceed the limit
      if (currentPhotoCount + files.length > MAX_PHOTOS_ALLOWED) {
        throw new BadRequestException(
          createErrorResponse(
            ErrorCode.MAX_PHOTOS_EXCEEDED,
            `Cannot upload ${files.length} photos. Current: ${currentPhotoCount}, Max: ${MAX_PHOTOS_ALLOWED}`,
          ),
        );
      }

      // Get the next order number (append after existing photos)
      const maxOrderResult = await userPhotoRepo
        .createQueryBuilder('photo')
        .select('MAX(photo.photoOrder)', 'maxOrder')
        .where('photo.userId = :userId', { userId })
        .getRawOne();

      let nextOrder = (maxOrderResult?.maxOrder ?? -1) + 1;

      // Upload and create new photos (append to existing)
      for (const file of files) {
        // In production, upload to cloud storage (S3, GCS, etc.)
        // For now, generate a placeholder URL
        const photoUrl = `https://storage.example.com/photos/${userId}/${Date.now()}-${file.originalname}`;

        const photo = userPhotoRepo.create({
          userId,
          photoUrl,
          photoOrder: nextOrder,
          isPrimary: currentPhotoCount === 0 && nextOrder === 0, // First photo is primary only if no existing photos
        });
        await userPhotoRepo.save(photo);
        nextOrder++;
      }
    }
    // Handle photos update from DTO if provided (for backward compatibility)
    else if (dto.photos !== undefined && Array.isArray(dto.photos)) {
      const userPhotoRepo = this.dataSource.getRepository(UserPhotoEntity);

      // Delete all existing photos
      await userPhotoRepo.delete({ userId });

      // Create new photos
      for (const photoData of dto.photos) {
        const photo = userPhotoRepo.create({
          userId,
          photoUrl: photoData.url,
          photoOrder: photoData.order,
          isPrimary: photoData.order === 0, // First photo is primary
        });
        await userPhotoRepo.save(photo);
      }
    }

    // Return updated user with photos
    const updatedUser = await userRepo.findOne({ where: { id: userId }, relations: ['photos'] });
    return updatedUser!;
  }

  /**
   * Delete user photo (for existing users)
   */
  async deleteUserPhoto(
    userId: string,
    photoId: string,
  ): Promise<{ deletedPhotoId: string; photoCount: number }> {
    const userRepo = this.dataSource.getRepository(UserEntity);
    const userPhotoRepo = this.dataSource.getRepository(UserPhotoEntity);

    // Check if user exists
    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(createErrorResponse(ErrorCode.USER_NOT_FOUND));
    }

    // Find the photo
    const photo = await userPhotoRepo.findOne({
      where: { id: photoId, userId },
    });

    if (!photo) {
      throw new NotFoundException(createErrorResponse(ErrorCode.PHOTO_NOT_FOUND));
    }

    // Delete the photo
    await userPhotoRepo.remove(photo);

    // If the deleted photo was primary, set the first remaining photo as primary
    if (photo.isPrimary) {
      const firstPhoto = await userPhotoRepo.findOne({
        where: { userId },
        order: { photoOrder: 'ASC' },
      });

      if (firstPhoto) {
        firstPhoto.isPrimary = true;
        await userPhotoRepo.save(firstPhoto);
      }
    }

    const photoCount = await userPhotoRepo.count({ where: { userId } });

    return {
      deletedPhotoId: photoId,
      photoCount,
    };
  }

  /**
   * Upload photo (Step 7)
   */
  async uploadPhoto(
    userId: string,
    photoUrl: string,
    order?: number,
  ): Promise<{ photo: DraftPhotoEntity; photos: DraftPhotoEntity[]; photoCount: number }> {
    // Validate draft exists
    await this.getDraftOrFail(userId);

    const currentCount = await this.draftPhotoRepository.countByDraftId(userId);

    if (currentCount >= MAX_PHOTOS_ALLOWED) {
      throw new BadRequestException(createErrorResponse(ErrorCode.MAX_PHOTOS_EXCEEDED));
    }

    const photoOrder = order ?? (await this.draftPhotoRepository.getNextOrder(userId));

    const photo = this.draftPhotoRepository.create({
      draftId: userId,
      photoUrl,
      photoOrder,
    });

    const savedPhoto = await this.draftPhotoRepository.save(photo);
    const photos = await this.draftPhotoRepository.findByDraftId(userId);

    return {
      photo: savedPhoto,
      photos,
      photoCount: photos.length,
    };
  }

  /**
   * Delete photo (Step 7)
   */
  async deletePhoto(
    userId: string,
    photoId: string,
  ): Promise<{ deletedPhotoId: string; photoCount: number }> {
    await this.getDraftOrFail(userId);

    const photo = await this.draftPhotoRepository.findOne({
      where: { id: photoId, draftId: userId },
    });

    if (!photo) {
      throw new NotFoundException(createErrorResponse(ErrorCode.PHOTO_NOT_FOUND));
    }

    await this.draftPhotoRepository.remove(photo);

    const photoCount = await this.draftPhotoRepository.countByDraftId(userId);

    return {
      deletedPhotoId: photoId,
      photoCount,
    };
  }

  /**
   * Get draft photos
   */
  async getPhotos(userId: string): Promise<DraftPhotoEntity[]> {
    await this.getDraftOrFail(userId);
    return this.draftPhotoRepository.findByDraftId(userId);
  }

  /**
   * Complete profile (Step 9)
   */
  async completeProfile(userId: string, dto: CompleteProfileDto) {
    const draft = await this.getDraftOrFail(userId);

    // Validate all required fields are present
    const missingFields = this.validateDraftComplete(draft);
    if (missingFields.length > 0) {
      const photoCount = await this.draftPhotoRepository.countByDraftId(userId);
      throw new BadRequestException({
        code: ErrorCode.INCOMPLETE_PROFILE,
        message: ErrorMessages[ErrorCode.INCOMPLETE_PROFILE],
        details: {
          missing_fields: missingFields,
          photos_required: MIN_PHOTOS_REQUIRED,
          photos_uploaded: photoCount,
        },
      });
    }

    // Hash password
    const hashedPassword = await this.hashPassword(dto.password);

    // Use transaction to create user and mark draft as completed
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create user entity
      const userRepo = queryRunner.manager.getRepository(UserEntity);
      const user = userRepo.create({
        id: draft.id, // Use same ID from draft
        email: draft.email,
        password: hashedPassword,
        firstName: draft.firstName!,
        gender: draft.gender,
        seeking: draft.seeking,
        dateOfBirth: draft.dateOfBirth,
        latitude: draft.latitude ? Number(draft.latitude) : undefined,
        longitude: draft.longitude ? Number(draft.longitude) : undefined,
        locationSkipped: draft.locationSkipped,
        emailVerified: false,
        // Extended profile fields
        aboutMe: draft.aboutMe,
        currentWork: draft.currentWork,
        school: draft.school,
        lookingFor: draft.lookingFor,
        pets: draft.pets,
        children: draft.children,
        astrologicalSign: draft.astrologicalSign,
        religion: draft.religion,
        education: draft.education,
        height: draft.height,
        bodyType: draft.bodyType,
        exercise: draft.exercise,
        drink: draft.drink,
        smoker: draft.smoker,
        marijuana: draft.marijuana,
      });

      const savedUser = await userRepo.save(user);

      // Move photos from draft to user
      const photos = await this.draftPhotoRepository.findByDraftId(userId);
      const userPhotoRepo = queryRunner.manager.getRepository(UserPhotoEntity);

      for (const photo of photos) {
        const userPhoto = userPhotoRepo.create({
          userId: savedUser.id,
          photoUrl: photo.photoUrl,
          photoOrder: photo.photoOrder,
          isPrimary: photo.photoOrder === 0,
        });
        await userPhotoRepo.save(userPhoto);
      }

      // Mark draft as completed
      await queryRunner.manager.update(DraftProfileEntity, userId, {
        status: DraftStatus.COMPLETED,
      });

      await queryRunner.commitTransaction();

      // Generate tokens
      const tokens = this.generateTokens(savedUser.id, savedUser.email, savedUser.role);

      // Fetch user with photos
      const completeUser = await userRepo.findOne({
        where: { id: savedUser.id },
        relations: ['photos'],
      });

      return {
        user: this.formatUserResponse(completeUser!),
        tokens,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get draft by ID or throw
   */
  private async getDraftOrFail(userId: string): Promise<DraftProfileEntity> {
    const draft = await this.draftRepository.findOne({
      where: {
        id: userId,
        status: DraftStatus.DRAFT,
      },
    });

    if (!draft) {
      throw new NotFoundException(createErrorResponse(ErrorCode.DRAFT_NOT_FOUND));
    }

    // Check expiration manually if needed, or rely on a scheduled task to clean up
    if (new Date() > draft.expiresAt) {
      throw new NotFoundException(createErrorResponse(ErrorCode.DRAFT_NOT_FOUND));
    }

    return draft;
  }

  /**
   * Calculate age from date of birth
   */
  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
      age--;
    }
    return age;
  }

  /**
   * Validate draft has all required fields
   */
  private validateDraftComplete(draft: DraftProfileEntity): string[] {
    const missing: string[] = [];

    if (!draft.firstName) missing.push('first_name');
    if (!draft.gender) missing.push('gender');
    if (!draft.seeking) missing.push('seeking');
    if (!draft.dateOfBirth) missing.push('date_of_birth');
    if (!draft.rulesAccepted) missing.push('rules_accepted');

    // Check location (either coords or skipped)
    if (!draft.locationSkipped && (!draft.latitude || !draft.longitude)) {
      missing.push('location');
    }

    // Check photos
    const photoCount = draft.photos?.length ?? 0;
    if (photoCount < MIN_PHOTOS_REQUIRED) {
      missing.push('photos');
    }

    return missing;
  }

  /**
   * Hash password
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Generate JWT tokens
   */
  private generateTokens(userId: string, email: string, role: string) {
    const payload = {
      sub: userId,
      email,
      role,
    };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.jwtRefreshSecret,
      expiresIn: this.configService.jwtRefreshExpiresIn,
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: this.parseExpiresIn(this.configService.jwtExpiresIn),
    };
  }

  /**
   * Parse expires_in string to seconds
   */
  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 3600;

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 3600;
    }
  }

  /**
   * Format user response
   */
  private formatUserResponse(user: UserEntity) {
    return {
      id: user.id,
      email: user.email,
      first_name: user.firstName,
      age: user.age,
      gender: user.gender,
      seeking: user.seeking,
      photos:
        user.photos?.map(photo => ({
          id: photo.id,
          url: photo.photoUrl,
          is_primary: photo.isPrimary,
        })) ?? [],
      created_at: user.createdAt.toISOString(),
    };
  }
}
