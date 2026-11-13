import { MigrationInterface, QueryRunner } from 'typeorm';

export class LeaderboardChoice1794700000000 implements MigrationInterface {
  name = 'LeaderboardChoice1794700000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE players ADD COLUMN show_on_leaderboard boolean NOT NULL DEFAULT false',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE players DROP COLUMN show_on_leaderboard',
    );
  }
}
