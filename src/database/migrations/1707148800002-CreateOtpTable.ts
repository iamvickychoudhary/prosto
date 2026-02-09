import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: Create OTP Table
 *
 * Creates table for storing one-time passwords.
 */
export class CreateOtpTable1707148800002 implements MigrationInterface {
  name = 'CreateOtpTable1707148800002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create otps table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "otps" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" varchar(255),
        "phone" varchar(20),
        "country_code" varchar(10),
        "code" varchar(10) NOT NULL,
        "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "used" boolean NOT NULL DEFAULT false,
        "attempts" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_otps" PRIMARY KEY ("id")
      )
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_otps_email" ON "otps" ("email")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_otps_phone" ON "otps" ("phone")
    `);

    // Create index on expires_at for cleanup queries
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_otps_expires_at" ON "otps" ("expires_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "otps"`);
  }
}
