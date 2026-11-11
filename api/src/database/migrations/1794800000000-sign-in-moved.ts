import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Signing in moved to auth.su-labs.dev, whose cookies are for all of su-labs.dev. Cookies from before were for
 * api.su-labs.dev only, which the auth service never sees, so it couldn't sign them out: everyone signs in once more.
 */
export class SignInMoved1794800000000 implements MigrationInterface {
  name = 'SignInMoved1794800000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM player_sessions');
    await queryRunner.query('DELETE FROM admin_sessions');
  }

  /** Ended sessions can't come back; nothing to undo */
  async down(): Promise<void> {}
}
