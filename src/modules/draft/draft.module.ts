import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DraftProfileEntity } from './entities/draft-profile.entity';
import { DraftPhotoEntity } from './entities/draft-photo.entity';
import { DraftProfileRepository, DraftPhotoRepository } from './repositories/draft.repository';
import { DraftService } from './services/draft.service';
import { DraftController } from './controllers/draft.controller';
import { UserModule } from '@modules/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([DraftProfileEntity, DraftPhotoEntity]), UserModule],
  controllers: [DraftController],
  providers: [DraftService, DraftProfileRepository, DraftPhotoRepository],
  exports: [DraftService, DraftProfileRepository, DraftPhotoRepository],
})
export class DraftModule {}
