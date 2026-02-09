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
  UploadedFile,
  ParseUUIDPipe,
  BadRequestException,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
  constructor(private readonly profileService: ProfileService) {}

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
  @UseInterceptors(FileInterceptor('photo'))
  @ApiOperation({
    summary: 'Upload photo',
    description: 'Step 7: Upload a photo to the draft profile.',
  })
  @ApiParam({ name: 'userId', description: 'Draft profile ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        photo: { type: 'string', format: 'binary' },
        order: { type: 'integer', description: 'Photo order (optional)' },
      },
      required: ['photo'],
    },
  })
  @ApiResponse({
    status: 200,
    description: SuccessMessages[SuccessCode.PHOTO_UPLOADED],
    type: PhotoUploadResponseDto,
  })
  async uploadPhoto(
    @Param('userId', ParseUUIDPipe) userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('order') order?: string,
  ) {
    if (!file) {
      throw new BadRequestException(
        createErrorResponse(ErrorCode.VALIDATION_ERROR, 'Photo file is required'),
      );
    }

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(createErrorResponse(ErrorCode.INVALID_FILE_TYPE));
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException(createErrorResponse(ErrorCode.FILE_SIZE_EXCEEDED));
    }

    // In production, upload to cloud storage (S3, GCS, etc.)
    // For now, generate a placeholder URL
    const photoUrl = `https://storage.example.com/photos/${userId}/${Date.now()}-${file.originalname}`;

    const parsedOrder = order !== undefined ? parseInt(order, 10) : undefined;

    const result = await this.profileService.uploadPhoto(userId, photoUrl, parsedOrder);

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
