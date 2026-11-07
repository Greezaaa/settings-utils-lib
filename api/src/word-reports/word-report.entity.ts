import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * A word players reported as rude, per language. After a few reports it stops counting in the word builder until
 * a moderator decides: approved keeps it out, rejected lets it count again.
 */
@Entity('word_reports')
export class WordReport {
  @PrimaryColumn({ type: 'varchar', length: 2 })
  language: string;

  @PrimaryColumn({ type: 'varchar', length: 20 })
  word: string;

  @Column({ type: 'integer', default: 0 })
  reports: number;

  @Column({ type: 'varchar', length: 10, default: 'pending' })
  status: string;

  @Column({ type: 'date' })
  firstReported: string;

  @Column({ type: 'date', nullable: true })
  decided: string | null;
}
