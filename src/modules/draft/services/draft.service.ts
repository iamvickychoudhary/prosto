import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { DraftProfileRepository } from '../repositories/draft.repository';
import { DraftProfileEntity } from '../entities/draft-profile.entity';
import { CreateDraftDto } from '../dto/create-draft.dto';
import { UserService } from '@modules/user/services/user.service';
import { ErrorCode } from '@common/enums';
import { createErrorResponse } from '@common/constants/messages.constants';

/**
 * Draft Service
 *
 * Handles draft profile creation for the registration flow.
 */
@Injectable()
export class DraftService {
  constructor(
    private readonly draftRepository: DraftProfileRepository,
    private readonly userService: UserService,
  ) {}

  /**
   * Create a new draft profile (Step 1)
   */
  async createDraft(dto: CreateDraftDto): Promise<DraftProfileEntity> {
    const email = dto.email.toLowerCase();

    // Check if email already exists as a user
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException(createErrorResponse(ErrorCode.EMAIL_EXISTS));
    }

    // Check if draft already exists
    const existingDraft = await this.draftRepository.findByEmail(email);
    if (existingDraft) {
      // Return existing draft if not expired
      if (existingDraft.expiresAt > new Date()) {
        return existingDraft;
      }
      // Delete expired draft
      await this.draftRepository.remove(existingDraft);
    }

    // Create new draft
    return this.draftRepository.createDraft(email);
  }

  /**
   * Find draft by ID
   */
  async findById(id: string): Promise<DraftProfileEntity> {
    const draft = await this.draftRepository.findActiveById(id);
    if (!draft) {
      throw new NotFoundException(createErrorResponse(ErrorCode.DRAFT_NOT_FOUND));
    }
    return draft;
  }

  /**
   * Find draft by ID (without throwing)
   */
  async findByIdOrNull(id: string): Promise<DraftProfileEntity | null> {
    return this.draftRepository.findActiveById(id);
  }
}
