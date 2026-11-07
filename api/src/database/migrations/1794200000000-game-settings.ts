import { MigrationInterface, QueryRunner } from 'typeorm';

/** The on/off switch for each game */
export class GameSettings1794200000000 implements MigrationInterface {
  name = 'GameSettings1794200000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE game_settings (
        game varchar(40) PRIMARY KEY,
        enabled boolean NOT NULL,
        updated date NOT NULL
      )`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE game_settings');
  }
}
