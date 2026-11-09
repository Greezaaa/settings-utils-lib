import { MigrationInterface, QueryRunner } from 'typeorm';

/** Players choose whether they appear on the leaderboards; nobody does until they say so */
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
