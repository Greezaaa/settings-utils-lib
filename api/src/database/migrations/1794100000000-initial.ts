import { MigrationInterface, QueryRunner } from 'typeorm';

/** The first tables: play counts, feedback, word reports and suggestions */
export class Initial1794100000000 implements MigrationInterface {
  name = 'Initial1794100000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE play_counts (
        game varchar(40) NOT NULL,
        day date NOT NULL,
        count integer NOT NULL DEFAULT 0,
        PRIMARY KEY (game, day)
      )`);
    await queryRunner.query(`
      CREATE TABLE feedback (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        game varchar(40) NOT NULL,
        vote varchar(4) NOT NULL,
        reason varchar(30),
        language varchar(2) NOT NULL,
        day date NOT NULL
      )`);
    await queryRunner.query(`
      CREATE TABLE word_reports (
        language varchar(2) NOT NULL,
        word varchar(20) NOT NULL,
        reports integer NOT NULL DEFAULT 0,
        status varchar(10) NOT NULL DEFAULT 'pending',
        "firstReported" date NOT NULL,
        decided date,
        PRIMARY KEY (language, word)
      )`);
    await queryRunner.query(`
      CREATE TABLE suggestions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        category varchar(20) NOT NULL,
        text varchar(500) NOT NULL,
        language varchar(2) NOT NULL,
        image varchar(60),
        status varchar(10) NOT NULL DEFAULT 'new',
        created timestamptz NOT NULL DEFAULT now()
      )`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of [
      'suggestions',
      'word_reports',
      'feedback',
      'play_counts',
    ]) {
      await queryRunner.query(`DROP TABLE ${table}`);
    }
  }
}
