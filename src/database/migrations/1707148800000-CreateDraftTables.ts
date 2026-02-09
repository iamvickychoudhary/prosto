import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: Create Draft Profile Tables
 *
 * Creates tables for the multi-step registration flow.
 */
export class CreateDraftTables1707148800000 implements MigrationInterface {
  name = 'CreateDraftTables1707148800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create gender enum type
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "gender_enum" AS ENUM ('man', 'woman');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create draft status enum type
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "draft_status_enum" AS ENUM ('draft', 'completed', 'expired');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create draft_profiles table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "draft_profiles" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" varchar(255) NOT NULL,
        "first_name" varchar(100),
        "latitude" decimal(10, 8),
        "longitude" decimal(11, 8),
        "location_skipped" boolean NOT NULL DEFAULT false,
        "gender" "gender_enum",
        "seeking" "gender_enum",
        "date_of_birth" date,
        "rules_accepted" boolean NOT NULL DEFAULT false,
        "status" "draft_status_enum" NOT NULL DEFAULT 'draft',
        "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours'),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_draft_profiles" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_draft_profiles_email" UNIQUE ("email")
      )
    `);

    // Create index on email
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_draft_profiles_email" ON "draft_profiles" ("email")
    `);

    // Create draft_photos table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "draft_photos" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "draft_id" uuid NOT NULL,
        "photo_url" varchar(500) NOT NULL,
        "photo_order" integer NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_draft_photos" PRIMARY KEY ("id"),
        CONSTRAINT "FK_draft_photos_draft" FOREIGN KEY ("draft_id") 
          REFERENCES "draft_profiles"("id") ON DELETE CASCADE
      )
    `);

    // Create index on draft_id
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_draft_photos_draft_id" ON "draft_photos" ("draft_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS "draft_photos"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "draft_profiles"`);

    // Note: We don't drop the enum types as they may be used by other tables
  }
}
