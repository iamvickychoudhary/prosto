import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: Update User Table for Dating App
 *
 * Adds dating-specific fields to the users table.
 */
export class UpdateUserTable1707148800001 implements MigrationInterface {
  name = 'UpdateUserTable1707148800001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Make last_name nullable
    await queryRunner.query(`
      ALTER TABLE "users" 
      ALTER COLUMN "last_name" DROP NOT NULL
    `);

    // Add country_code column
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "country_code" varchar(10)
    `);

    // Add gender column
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "gender" "gender_enum"
    `);

    // Add seeking column
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "seeking" "gender_enum"
    `);

    // Add date_of_birth column
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "date_of_birth" date
    `);

    // Add latitude column
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "latitude" decimal(10, 8)
    `);

    // Add longitude column
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "longitude" decimal(11, 8)
    `);

    // Add location_skipped column
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "location_skipped" boolean NOT NULL DEFAULT false
    `);

    // Create user_photos table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_photos" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "photo_url" varchar(500) NOT NULL,
        "photo_order" integer NOT NULL,
        "is_primary" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_photos" PRIMARY KEY ("id"),
        CONSTRAINT "FK_user_photos_user" FOREIGN KEY ("user_id") 
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create index on user_id
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_user_photos_user_id" ON "user_photos" ("user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop user_photos table
    await queryRunner.query(`DROP TABLE IF EXISTS "user_photos"`);

    // Remove added columns
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "location_skipped"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "longitude"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "latitude"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "date_of_birth"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "seeking"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "gender"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "country_code"`);

    // Make last_name required again
    await queryRunner.query(`
      ALTER TABLE "users" 
      ALTER COLUMN "last_name" SET NOT NULL
    `);
  }
}
