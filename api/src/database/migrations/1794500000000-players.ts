import { MigrationInterface, QueryRunner } from 'typeorm';

/** Player accounts, their signed-in browsers, and their results per game and settings */
export class Players1794500000000 implements MigrationInterface {
  name = 'Players1794500000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE players (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        login_name varchar(30) NOT NULL UNIQUE,
        screen_name varchar(20) NOT NULL,
        screen_name_key varchar(20) NOT NULL UNIQUE,
        password_hash text NOT NULL,
        email varchar(254) UNIQUE,
        reset_hash char(64) UNIQUE,
        reset_expires timestamptz,
        failed_logins integer NOT NULL DEFAULT 0,
        locked_until timestamptz,
        favorites varchar(40)[] NOT NULL DEFAULT '{}',
        created timestamptz NOT NULL DEFAULT now()
      )`);
    await queryRunner.query(`
      CREATE TABLE player_sessions (
        token_hash char(64) PRIMARY KEY,
        player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
        expires timestamptz NOT NULL
      )`);
    await queryRunner.query(`
      CREATE TABLE player_results (
        player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
        game varchar(40) NOT NULL,
        key varchar(60) NOT NULL,
        plays integer NOT NULL DEFAULT 0,
        best integer NOT NULL,
        updated timestamptz NOT NULL DEFAULT now(),
        PRIMARY KEY (player_id, game, key)
      )`);
    // The leaderboard ranks one game and key at a time
    await queryRunner.query(
      'CREATE INDEX player_results_board ON player_results (game, key, best)',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE player_results');
    await queryRunner.query('DROP TABLE player_sessions');
    await queryRunner.query('DROP TABLE players');
  }
}
