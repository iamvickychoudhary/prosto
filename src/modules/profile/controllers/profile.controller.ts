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

    return withMessage(response, SuccessMessages[SuccessCode.PROFILE_UPDATED]);
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
