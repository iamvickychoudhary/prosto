import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * TypeORM Data Source Options
 *
 * Base configuration for TypeORM used by both
 * the application and CLI migrations.
 */
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'enterprise_db',

  // Entity configuration
  entities: [__dirname + '/entities/**/*.entity{.ts,.js}'],

  // Migration configuration
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  migrationsTableName: 'migrations',

  // Connection settings
  synchronize: false, // Never use in production
  logging: process.env.DB_LOGGING === 'true',

  // Connection pool
  extra: {
    max: 20, // Maximum connections in pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
};

/**
 * Data Source for TypeORM CLI
 *
 * Used by migration commands:
 * - npm run migration:generate
 * - npm run migration:run
 * - npm run migration:revert
 */
const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
