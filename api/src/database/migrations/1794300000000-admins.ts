import { MigrationInterface, QueryRunner } from 'typeorm';

export class Admins1794300000000 implements MigrationInterface {
  name = 'Admins1794300000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE admins (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email varchar(254) NOT NULL UNIQUE,
        role varchar(10) NOT NULL DEFAULT 'moderator',
        active boolean NOT NULL DEFAULT true,
        password_hash text,
        invite_hash char(64) UNIQUE,
        invite_expires timestamptz,
        failed_logins integer NOT NULL DEFAULT 0,
        locked_until timestamptz,
        created timestamptz NOT NULL DEFAULT now()
      )`);
    await queryRunner.query(`
      CREATE TABLE admin_sessions (
        token_hash char(64) PRIMARY KEY,
        admin_id uuid NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
        expires timestamptz NOT NULL
      )`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE admin_sessions');
    await queryRunner.query('DROP TABLE admins');
  }
}
