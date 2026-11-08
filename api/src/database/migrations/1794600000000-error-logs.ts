import { MigrationInterface, QueryRunner } from 'typeorm';

/** Errors from the API and the games site, for the super admin */
export class ErrorLogs1794600000000 implements MigrationInterface {
  name = 'ErrorLogs1794600000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE error_logs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        fingerprint char(64) NOT NULL UNIQUE,
        source varchar(10) NOT NULL,
        code varchar(20) NOT NULL,
        title varchar(120) NOT NULL,
        problem text NOT NULL,
        path varchar(200) NOT NULL,
        count integer NOT NULL DEFAULT 1,
        first_seen timestamptz NOT NULL,
        last_seen timestamptz NOT NULL
      )`);
    await queryRunner.query(
      'CREATE INDEX error_logs_last_seen ON error_logs (last_seen)',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE error_logs');
  }
}
