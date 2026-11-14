import { MigrationInterface, QueryRunner } from 'typeorm';

export class GameThumbnails1795300000000 implements MigrationInterface {
  name = 'GameThumbnails1795300000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE game_thumbnails (game varchar(40) PRIMARY KEY, updated timestamptz NOT NULL)');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE game_thumbnails');
  }
}
