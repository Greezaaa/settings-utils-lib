import { MigrationInterface, QueryRunner } from 'typeorm';

/** The on/off switch for each feature, like the games' switches */
export class FeatureFlags1794400000000 implements MigrationInterface {
  name = 'FeatureFlags1794400000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE feature_flags (
        feature varchar(40) PRIMARY KEY,
        enabled boolean NOT NULL,
        updated date NOT NULL
      )`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE feature_flags');
  }
}
