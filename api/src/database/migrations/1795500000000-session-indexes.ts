import { MigrationInterface, QueryRunner } from 'typeorm';

const INDEXES = [
  ['admin_sessions_admin_id', 'admin_sessions (admin_id)'],
  ['admin_sessions_expires', 'admin_sessions (expires)'],
  ['player_sessions_player_id', 'player_sessions (player_id)'],
  ['player_sessions_expires', 'player_sessions (expires)'],
] as const;

export class SessionIndexes1795500000000 implements MigrationInterface {
  name = 'SessionIndexes1795500000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    for (const [name, target] of INDEXES) {
      await queryRunner.query(
        `CREATE INDEX IF NOT EXISTS ${name} ON ${target}`,
      );
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    for (const [name] of INDEXES) {
      await queryRunner.query(`DROP INDEX IF EXISTS ${name}`);
    }
  }
}
