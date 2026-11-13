import { MigrationInterface, QueryRunner } from 'typeorm';

export class BoardModeration1795000000000 implements MigrationInterface {
  name = 'BoardModeration1795000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE players ADD COLUMN removed_from_boards boolean NOT NULL DEFAULT false',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE players DROP COLUMN removed_from_boards',
    );
  }
}
