import { MigrationInterface, QueryRunner } from 'typeorm';

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
