import { MigrationInterface, QueryRunner } from 'typeorm';

export class NameApproval1795100000000 implements MigrationInterface {
  name = 'NameApproval1795100000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE players ADD COLUMN name_approved boolean NOT NULL DEFAULT false, ADD COLUMN name_reports integer NOT NULL DEFAULT 0',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE players DROP COLUMN name_approved, DROP COLUMN name_reports',
    );
  }
}
