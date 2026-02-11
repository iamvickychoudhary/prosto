import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { SimpleUserDto } from '../dto/simple-user.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { Public } from '@modules/auth/decorators/public.decorator';
import { UserRole } from '@common/enums/user-role.enum';
import { ParseUUIDPipe } from '@core/pipes/validation.pipe';
import {
  ApiStandardResponse,
  ApiPaginatedResponse,
  ApiErrorResponses,
} from '@core/decorators/api-response.decorator';

/**
 * User Controller
 *
 * Thin controller exposing user endpoints.
 * All business logic is delegated to UserService.
 */
@ApiTags('users')
@Controller({ path: 'users', version: VERSION_NEUTRAL })
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@ApiErrorResponses()
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get all users (paginated)' })
  @ApiPaginatedResponse(UserResponseDto)
  async findAll(@Query() pagination: PaginationDto) {
    return this.userService.findAll(pagination);
  }

  @Get('list')
  @ApiOperation({ summary: 'Get list of users (excluding self and interactions)' })
  @ApiStandardResponse(SimpleUserDto, { isArray: true })
  async getList(@CurrentUser('sub') userId: string) {
    return this.userService.getList(userId);
  }

  @Get('search')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Search users by name or email' })
  @ApiQuery({ name: 'q', description: 'Search query' })
  async search(@Query('q') query: string) {
    return this.userService.search(query);
  }

  @Get('statistics')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user statistics' })
  async getStatistics() {
    return this.userService.getStatistics();
  }

  /**
   * Get user profile by ID (requires authentication)
   * Returns complete user data
   */
  @Get('profile/:id')
  @ApiOperation({
    summary: 'Get user profile by ID',
    description: 'Returns complete user profile data including photos, preferences, and location. Authentication required.'
  })
  @ApiParam({ name: 'id', description: 'User UUID' })
  async getUserProfile(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.userService.findByIdOrFail(id);

    // Return complete user data formatted consistently with login response
    return {
      id: user.id,
      email: user.email,
      phone: user.phone ? `${user.countryCode}${user.phone}` : undefined,
      country_code: user.countryCode,
      first_name: user.firstName,
      last_name: user.lastName,
      full_name: user.fullName,
      role: user.role,
      status: user.status,
      avatar_url: user.avatarUrl,
      email_verified: user.emailVerified,
      email_verified_at: user.emailVerifiedAt,
      last_login_at: user.lastLoginAt,
      gender: user.gender,
      seeking: user.seeking,
      date_of_birth: user.dateOfBirth,
      age: user.age,
      latitude: user.latitude,
      longitude: user.longitude,
      location_skipped: user.locationSkipped,
      // Extended profile fields
      about_me: user.aboutMe,
      current_work: user.currentWork,
      school: user.school,
      looking_for: user.lookingFor,
      pets: user.pets,
      children: user.children,
      astrological_sign: user.astrologicalSign,
      religion: user.religion,
      education: user.education,
      height: user.height,
      body_type: user.bodyType,
      exercise: user.exercise,
      drink: user.drink,
      smoker: user.smoker,
      marijuana: user.marijuana,
      photos: user.photos?.map(photo => ({
        id: photo.id,
        url: photo.photoUrl,
        order: photo.photoOrder,
        is_primary: photo.isPrimary,
        created_at: photo.createdAt,
      })) || [],
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiStandardResponse(UserResponseDto)
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.findByIdOrFail(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new user' })
  async create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.userService.delete(id);
  }

  @Post(':id/verify-email')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Manually verify user email' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  async verifyEmail(@Param('id', ParseUUIDPipe) id: string) {
    await this.userService.verifyEmail(id);
    return { message: 'Email verified successfully' };
  }
}
