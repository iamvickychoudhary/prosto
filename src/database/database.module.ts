import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppConfigService } from '@config/app-config.service';
import { dataSourceOptions } from './data-source';

/**
 * Database Module
 *
 * Configures TypeORM with PostgreSQL for the application.
 * Features:
 * - Async configuration from AppConfigService
 * - Repository pattern support
 * - Migration support
 * - Connection pooling
 * - SSL support for production
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: AppConfigService): TypeOrmModuleOptions => {
        const dbConfig = configService.databaseConfig;
        return {
          ...dataSourceOptions,
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.database,
          synchronize: dbConfig.synchronize,
          logging: dbConfig.logging,
          ssl: dbConfig.ssl
            ? {
                rejectUnauthorized: false,
              }
            : false,
        } as TypeOrmModuleOptions;
      },
      inject: [AppConfigService],
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
