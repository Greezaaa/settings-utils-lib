import { MigrationInterface, QueryRunner } from 'typeorm';

export class GameCategories1795200000000 implements MigrationInterface {
  name = 'GameCategories1795200000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE game_categories (game varchar(40) PRIMARY KEY, categories text[] NOT NULL, updated date NOT NULL)',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE game_categories');
  }
}
