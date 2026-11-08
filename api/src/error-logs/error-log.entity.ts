import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Where an error happened: the API itself, or a visitor's browser on the games site */
export const ERROR_SOURCES = ['api', 'site'] as const;
export type ErrorSource = (typeof ERROR_SOURCES)[number];

/**
 * An error, for the super admin's Errors tab: one row per distinct error (same source, code, title, problem and page),
 * counted each time it happens again. Nothing about the visitor is kept.
 */
@Entity('error_logs')
export class ErrorLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** SHA-256 of what makes the error distinct, so the same error is counted instead of stored again */
  @Column({ type: 'char', length: 64, unique: true })
  fingerprint: string;

  @Column({ type: 'varchar', length: 10 })
  source: ErrorSource;

  /** An HTTP status for the API (e.g. `500`), or a short code from the site (e.g. `js`) */
  @Column({ type: 'varchar', length: 20 })
  code: string;

  /** The error's name, e.g. `TypeError` */
  @Column({ type: 'varchar', length: 120 })
  title: string;

  /** What went wrong, as the error said it */
  @Column({ type: 'text' })
  problem: string;

  /** The endpoint (API) or page (site), without its query */
  @Column({ type: 'varchar', length: 200 })
  path: string;

  @Column({ type: 'integer', default: 1 })
  count: number;

  @Column({ type: 'timestamptz', name: 'first_seen' })
  firstSeen: Date;

  @Column({ type: 'timestamptz', name: 'last_seen' })
  lastSeen: Date;
}
