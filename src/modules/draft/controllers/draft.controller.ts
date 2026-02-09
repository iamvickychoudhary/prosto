import { Controller, Post, Body, HttpCode, HttpStatus, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { DraftService } from '../services/draft.service';
import { CreateDraftDto } from '../dto/create-draft.dto';
import { DraftResponseDto } from '../dto/draft-response.dto';
import { Public } from '@modules/auth/decorators/public.decorator';
import { ApiErrorResponses } from '@core/decorators/api-response.decorator';
import { withMessage } from '@core/interceptors/transform.interceptor';
import { ErrorCode, SuccessCode } from '@common/enums';
import { ErrorMessages, SuccessMessages } from '@common/constants/messages.constants';

/**
 * Draft Controller
 *
 * Handles draft profile creation for the registration flow.
 * Endpoint: POST /api/draft
 */
@ApiTags('registration')
@Controller({ path: 'draft', version: VERSION_NEUTRAL })
@ApiErrorResponses()
export class DraftController {
  constructor(private readonly draftService: DraftService) {}

  /**
   * Step 1: Create draft profile with email
   */
  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create draft profile',
    description:
      'Step 1 of registration: Create a draft profile with email. Returns user_id for subsequent steps.',
  })
  @ApiBody({ type: CreateDraftDto })
  @ApiResponse({
    status: 201,
    description: SuccessMessages[SuccessCode.DRAFT_CREATED],
    type: DraftResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: ErrorMessages[ErrorCode.EMAIL_EXISTS],
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        error: {
          type: 'object',
          properties: {
            code: { type: 'string', example: ErrorCode.EMAIL_EXISTS },
            message: { type: 'string', example: ErrorMessages[ErrorCode.EMAIL_EXISTS] },
          },
        },
      },
    },
  })
  async createDraft(@Body() dto: CreateDraftDto) {
    const draft = await this.draftService.createDraft(dto);

    return withMessage(
      {
        user_id: draft.id,
        email: draft.email,
      },
      SuccessMessages[SuccessCode.DRAFT_CREATED],
    );
  }
}
