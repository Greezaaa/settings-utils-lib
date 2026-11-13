import { MigrationInterface, QueryRunner } from 'typeorm';

export class SignInMoved1794800000000 implements MigrationInterface {
  name = 'SignInMoved1794800000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM player_sessions');
    await queryRunner.query('DELETE FROM admin_sessions');
  }

  async down(): Promise<void> {}
}
