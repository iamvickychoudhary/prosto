import {
  Controller,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFiles,
  ParseUUIDPipe,
  BadRequestException,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiConsumes,
  ApiParam,
} from '@nestjs/swagger';
import { ProfileService } from '../services/profile.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { CompleteProfileDto } from '../dto/complete-profile.dto';
import {
  ProfileUpdateResponseDto,
  PhotoUploadResponseDto,
  PhotoDeleteResponseDto,
  ProfileCompleteResponseDto,
} from '../dto/response.dto';
import { Public } from '@modules/auth/decorators/public.decorator';
import { ApiErrorResponses } from '@core/decorators/api-response.decorator';
import { withMessage } from '@core/interceptors/transform.interceptor';
import { ErrorCode, SuccessCode } from '@common/enums';
import { SuccessMessages, createErrorResponse } from '@common/constants/messages.constants';

/**
 * Profile Controller
 *
 * Handles profile updates during registration flow (Steps 2-9).
 * Endpoints: PATCH /api/profile/{user_id}, POST /api/profile/{user_id}/photos, etc.
 */
@ApiTags('registration')
@Controller({ path: 'profile', version: VERSION_NEUTRAL })
@ApiErrorResponses()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) { }

  /**
   * Steps 2-6, 8: Update profile fields
   */
  @Patch(':userId')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update profile fields',
    description: 'Steps 2-6, 8: Update profile fields one at a time during registration.',
  })
  @ApiParam({ name: 'userId', description: 'Draft profile ID' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({
    status: 200,
    description: SuccessMessages[SuccessCode.PROFILE_UPDATED],
    type: ProfileUpdateResponseDto,
  })
  async updateProfile(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    const draft = await this.profileService.updateProfile(userId, dto);

    const response: Record<string, unknown> = { user_id: draft.id };

    // Include updated fields in response
    if (dto.first_name !== undefined) response.first_name = draft.firstName;
    if (dto.gender !== undefined) response.gender = draft.gender;
    if (dto.seeking !== undefined) response.seeking = draft.seeking;
    if (dto.date_of_birth !== undefined) {
      response.date_of_birth = draft.dateOfBirth?.toISOString().split('T')[0];
      response.age = draft.age;
    }
    if (dto.latitude !== undefined || dto.longitude !== undefined) {
      response.latitude = draft.latitude;
      response.longitude = draft.longitude;
      response.location_skipped = draft.locationSkipped;
    }
    if (dto.location_skipped !== undefined) {
      response.location_skipped = draft.locationSkipped;
    }
    if (dto.rules_accepted !== undefined) response.rules_accepted = draft.rulesAccepted;

    // Extended profile fields
    if (dto.about_me !== undefined) response.about_me = draft.aboutMe;
    if (dto.current_work !== undefined) response.current_work = draft.currentWork;
    if (dto.school !== undefined) response.school = draft.school;
    if (dto.looking_for !== undefined) response.looking_for = draft.lookingFor;
    if (dto.pets !== undefined) response.pets = draft.pets;
    if (dto.children !== undefined) response.children = draft.children;
    if (dto.astrological_sign !== undefined) response.astrological_sign = draft.astrologicalSign;
    if (dto.religion !== undefined) response.religion = draft.religion;
    if (dto.education !== undefined) response.education = draft.education;
    if (dto.height !== undefined) response.height = draft.height;
    if (dto.body_type !== undefined) response.body_type = draft.bodyType;
    if (dto.exercise !== undefined) response.exercise = draft.exercise;
    if (dto.drink !== undefined) response.drink = draft.drink;
    if (dto.smoker !== undefined) response.smoker = draft.smoker;
    if (dto.marijuana !== undefined) response.marijuana = draft.marijuana;

    return withMessage(response, SuccessMessages[SuccessCode.PROFILE_UPDATED]);
  }

  /**
   * Update existing user profile (for logged-in users)
   */
  @Patch('user/:userId')
  @Public()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(AnyFilesInterceptor())
  @ApiOperation({
    summary: 'Update user profile',
    description: 'Update existing user profile with extended fields and photos. Use this endpoint for updating profiles after registration is complete.',
  })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        gender: { type: 'string', example: 'woman' },
        current_work: { type: 'string', example: 'Senior Software Engineer' },
        school: { type: 'string', example: 'MIT' },
        date_of_birth: { type: 'string', format: 'date', example: '1995-10-11' },
        about_me: { type: 'string', example: 'this is my about' },
        first_name: { type: 'string', example: 'John' },
        seeking: { type: 'string', example: 'man' },
        latitude: { type: 'number', example: 40.7128 },
        longitude: { type: 'number', example: -74.006 },
        location_skipped: { type: 'boolean', example: false },
        looking_for: { type: 'array', items: { type: 'string' } },
        pets: { type: 'array', items: { type: 'string' } },
        children: { type: 'string', example: 'Want someday' },
        astrological_sign: { type: 'string', example: 'Aries' },
        religion: { type: 'string', example: 'Christian' },
        education: { type: 'string', example: 'Bachelors Degree' },
        height: { type: 'string', example: '5\'10"' },
        body_type: { type: 'string', example: 'Athletic' },
        exercise: { type: 'string', example: 'Often' },
        drink: { type: 'string', example: 'Socially' },
        smoker: { type: 'string', example: 'No' },
        marijuana: { type: 'string', example: 'Never' },
        photos: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Photo files to upload',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: SuccessMessages[SuccessCode.PROFILE_UPDATED],
    type: ProfileUpdateResponseDto,
  })
  async updateUserProfile(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() body: any,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    // Parse the body data
    const dto: UpdateProfileDto = {};

    // Map form fields to DTO
    if (body.first_name !== undefined) dto.first_name = body.first_name;
    if (body.gender !== undefined) dto.gender = body.gender;
    if (body.seeking !== undefined) dto.seeking = body.seeking;
    if (body.date_of_birth !== undefined) dto.date_of_birth = body.date_of_birth;
    if (body.latitude !== undefined) dto.latitude = parseFloat(body.latitude);
    if (body.longitude !== undefined) dto.longitude = parseFloat(body.longitude);
    if (body.location_skipped !== undefined) dto.location_skipped = body.location_skipped === 'true' || body.location_skipped === true;
    if (body.about_me !== undefined) dto.about_me = body.about_me;
    if (body.current_work !== undefined) dto.current_work = body.current_work;
    if (body.school !== undefined) dto.school = body.school;
    if (body.looking_for !== undefined) dto.looking_for = Array.isArray(body.looking_for) ? body.looking_for : [body.looking_for];
    if (body.pets !== undefined) dto.pets = Array.isArray(body.pets) ? body.pets : [body.pets];
    if (body.children !== undefined) dto.children = body.children;
    if (body.astrological_sign !== undefined) dto.astrological_sign = body.astrological_sign;
    if (body.religion !== undefined) dto.religion = body.religion;
    if (body.education !== undefined) dto.education = body.education;
    if (body.height !== undefined) dto.height = body.height;
    if (body.body_type !== undefined) dto.body_type = body.body_type;
    if (body.exercise !== undefined) dto.exercise = body.exercise;
    if (body.drink !== undefined) dto.drink = body.drink;
    if (body.smoker !== undefined) dto.smoker = body.smoker;
    if (body.marijuana !== undefined) dto.marijuana = body.marijuana;

    // Validate and process uploaded photo files
    if (files && files.length > 0) {
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      for (const file of files) {
        if (!allowedMimeTypes.includes(file.mimetype)) {
          throw new BadRequestException(createErrorResponse(ErrorCode.INVALID_FILE_TYPE));
        }
        if (file.size > maxSize) {
          throw new BadRequestException(createErrorResponse(ErrorCode.FILE_SIZE_EXCEEDED));
        }
      }
    }

    const user = await this.profileService.updateUserProfile(userId, dto, files);

    const response: Record<string, unknown> = { user_id: user.id };

    // Include updated fields in response
    if (dto.first_name !== undefined) response.first_name = user.firstName;
    if (dto.gender !== undefined) response.gender = user.gender;
    if (dto.seeking !== undefined) response.seeking = user.seeking;
    if (dto.date_of_birth !== undefined) {
      response.date_of_birth = user.dateOfBirth?.toISOString().split('T')[0];
      response.age = user.age;
    }
    if (dto.latitude !== undefined || dto.longitude !== undefined) {
      response.latitude = user.latitude;
      response.longitude = user.longitude;
      response.location_skipped = user.locationSkipped;
    }
    if (dto.location_skipped !== undefined) {
      response.location_skipped = user.locationSkipped;
    }

    // Extended profile fields
    if (dto.about_me !== undefined) response.about_me = user.aboutMe;
    if (dto.current_work !== undefined) response.current_work = user.currentWork;
    if (dto.school !== undefined) response.school = user.school;
    if (dto.looking_for !== undefined) response.looking_for = user.lookingFor;
    if (dto.pets !== undefined) response.pets = user.pets;
    if (dto.children !== undefined) response.children = user.children;
    if (dto.astrological_sign !== undefined) response.astrological_sign = user.astrologicalSign;
    if (dto.religion !== undefined) response.religion = user.religion;
    if (dto.education !== undefined) response.education = user.education;
    if (dto.height !== undefined) response.height = user.height;
    if (dto.body_type !== undefined) response.body_type = user.bodyType;
    if (dto.exercise !== undefined) response.exercise = user.exercise;
    if (dto.drink !== undefined) response.drink = user.drink;
    if (dto.smoker !== undefined) response.smoker = user.smoker;
    if (dto.marijuana !== undefined) response.marijuana = user.marijuana;

    // Include photos if they were updated
    if (files && files.length > 0) {
      response.photos = user.photos?.map(photo => ({
        id: photo.id,
        url: photo.photoUrl,
        order: photo.photoOrder,
        is_primary: photo.isPrimary,
      })) ?? [];
    } else if (dto.photos !== undefined) {
      response.photos = user.photos?.map(photo => ({
        id: photo.id,
        url: photo.photoUrl,
        order: photo.photoOrder,
        is_primary: photo.isPrimary,
      })) ?? [];
    }

    return withMessage(response, SuccessMessages[SuccessCode.PROFILE_UPDATED]);
  }

  /**
   * Delete user photo (for existing users)
   */
  @Delete('user/:userId/photos/:photoId')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete user photo',
    description: 'Delete a photo from an existing user profile. If the deleted photo was primary, the first remaining photo will become primary.',
  })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiParam({ name: 'photoId', description: 'Photo ID to delete' })
  @ApiResponse({
    status: 200,
    description: SuccessMessages[SuccessCode.PHOTO_DELETED],
    type: PhotoDeleteResponseDto,
  })
  async deleteUserPhoto(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('photoId', ParseUUIDPipe) photoId: string,
  ) {
    const result = await this.profileService.deleteUserPhoto(userId, photoId);

    return withMessage(
      {
        deleted_photo_id: result.deletedPhotoId,
        photo_count: result.photoCount,
      },
      SuccessMessages[SuccessCode.PHOTO_DELETED],
    );
  }

  /**
   * Step 7: Upload photo
   */
  @Post(':userId/photos')
  @Public()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(AnyFilesInterceptor())
  @ApiOperation({
    summary: 'Upload photo(s)',
    description: 'Step 7: Upload photo(s) to the draft profile. Supports single "photo" and batch "photos" fields.',
  })
  @ApiParam({ name: 'userId', description: 'Draft profile ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        photo: { type: 'string', format: 'binary', description: 'Single file upload' },
        photos: { type: 'array', items: { type: 'string', format: 'binary' }, description: 'Batch upload' },
        order: { type: 'integer', description: 'Photo order (optional, for single upload)' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: SuccessMessages[SuccessCode.PHOTO_UPLOADED],
    type: PhotoUploadResponseDto,
  })
  async uploadPhoto(
    @Param('userId', ParseUUIDPipe) userId: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: { order?: string },
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException(
        createErrorResponse(ErrorCode.VALIDATION_ERROR, 'No photos uploaded'),
      );
    }

    // Validate all files first
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;

    for (const file of files) {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(createErrorResponse(ErrorCode.INVALID_FILE_TYPE));
      }
      if (file.size > maxSize) {
        throw new BadRequestException(createErrorResponse(ErrorCode.FILE_SIZE_EXCEEDED));
      }
    }

    let result;

    // Process each file
    for (const file of files) {
      // In production, upload to cloud storage (S3, GCS, etc.)
      // For now, generate a placeholder URL
      const photoUrl = `https://storage.example.com/photos/${userId}/${Date.now()}-${file.originalname}`;

      // Only respect order if single file is uploaded, otherwise append
      const parsedOrder = (files.length === 1 && body.order !== undefined)
        ? parseInt(body.order, 10)
        : undefined;

      result = await this.profileService.uploadPhoto(userId, photoUrl, parsedOrder);
    }

    if (!result) {
      throw new BadRequestException(
        createErrorResponse(ErrorCode.VALIDATION_ERROR, 'No photos processed'),
      );
    }

    // Return result of the last upload (contains updated list)
    return withMessage(
      {
        photo: {
          id: result.photo.id,
          url: result.photo.photoUrl,
          order: result.photo.photoOrder,
        },
        photos: result.photos.map(p => ({
          id: p.id,
          url: p.photoUrl,
          order: p.photoOrder,
        })),
        photo_count: result.photoCount,
      },
      SuccessMessages[SuccessCode.PHOTO_UPLOADED],
    );
  }

  /**
   * Step 7: Delete photo
   */
  @Delete(':userId/photos/:photoId')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete photo',
    description: 'Step 7: Delete a photo from the draft profile.',
  })
  @ApiParam({ name: 'userId', description: 'Draft profile ID' })
  @ApiParam({ name: 'photoId', description: 'Photo ID to delete' })
  @ApiResponse({
    status: 200,
    description: SuccessMessages[SuccessCode.PHOTO_DELETED],
    type: PhotoDeleteResponseDto,
  })
  async deletePhoto(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('photoId', ParseUUIDPipe) photoId: string,
  ) {
    const result = await this.profileService.deletePhoto(userId, photoId);

    return withMessage(
      {
        deleted_photo_id: result.deletedPhotoId,
        photo_count: result.photoCount,
      },
      SuccessMessages[SuccessCode.PHOTO_DELETED],
    );
  }

  /**
   * Step 9: Complete profile
   */
  @Post(':userId/complete')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Complete profile',
    description: 'Step 9: Finalize profile and create active user account.',
  })
  @ApiParam({ name: 'userId', description: 'Draft profile ID' })
  @ApiBody({ type: CompleteProfileDto })
  @ApiResponse({
    status: 201,
    description: SuccessMessages[SuccessCode.PROFILE_COMPLETED],
    type: ProfileCompleteResponseDto,
  })
  async completeProfile(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: CompleteProfileDto,
  ) {
    const result = await this.profileService.completeProfile(userId, dto);
    return withMessage(result, SuccessMessages[SuccessCode.PROFILE_COMPLETED]);
  }
}
