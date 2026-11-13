import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export const ERROR_SOURCES = ['api', 'site'] as const;
export type ErrorSource = (typeof ERROR_SOURCES)[number];

@Entity('error_logs')
export class ErrorLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'char', length: 64, unique: true })
  fingerprint: string;

  @Column({ type: 'varchar', length: 10 })
  source: ErrorSource;

  @Column({ type: 'varchar', length: 20 })
  code: string;

  @Column({ type: 'varchar', length: 120 })
  title: string;

  @Column({ type: 'text' })
  problem: string;

  @Column({ type: 'varchar', length: 200 })
  path: string;

  @Column({ type: 'integer', default: 1 })
  count: number;

  @Column({ type: 'timestamptz', name: 'first_seen' })
  firstSeen: Date;

  @Column({ type: 'timestamptz', name: 'last_seen' })
  lastSeen: Date;
}
