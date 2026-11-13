import { MigrationInterface, QueryRunner } from 'typeorm';

export class PlayerApps1794900000000 implements MigrationInterface {
  name = 'PlayerApps1794900000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE players ADD COLUMN app varchar(20) NOT NULL DEFAULT 'games'",
    );
    await queryRunner.query(
      'ALTER TABLE players ALTER COLUMN app DROP DEFAULT',
    );
    await queryRunner.query(`
      ALTER TABLE players
        DROP CONSTRAINT players_login_name_key,
        DROP CONSTRAINT players_screen_name_key_key,
        DROP CONSTRAINT players_email_key,
        ADD CONSTRAINT players_app_login_name UNIQUE (app, login_name),
        ADD CONSTRAINT players_app_screen_name UNIQUE (app, screen_name_key),
        ADD CONSTRAINT players_app_email UNIQUE (app, email)`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE players
        DROP CONSTRAINT players_app_login_name,
        DROP CONSTRAINT players_app_screen_name,
        DROP CONSTRAINT players_app_email,
        ADD CONSTRAINT players_login_name_key UNIQUE (login_name),
        ADD CONSTRAINT players_screen_name_key_key UNIQUE (screen_name_key),
        ADD CONSTRAINT players_email_key UNIQUE (email)`);
    await queryRunner.query('ALTER TABLE players DROP COLUMN app');
  }
}
