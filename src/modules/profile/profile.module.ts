import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ProfileController } from './controllers/profile.controller';
import { ProfileService } from './services/profile.service';
import { DraftModule } from '@modules/draft/draft.module';
import { AppConfigModule } from '@config/config.module';
import { AppConfigService } from '@config/app-config.service';

@Module({
  imports: [
    DraftModule,
    AppConfigModule,
    JwtModule.registerAsync({
      imports: [AppConfigModule],
      useFactory: (configService: AppConfigService) => ({
        secret: configService.jwtSecret,
        signOptions: {
          expiresIn: configService.jwtExpiresIn,
        },
      }),
      inject: [AppConfigService],
    }),
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
