import { createHash } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { ErrorLog, ErrorSource } from './error-log.entity.js';

/** How long an error stays in the log after it last happened */
const KEEP_DAYS = 90;
const DAY_MS = 24 * 60 * 60 * 1000;
/** Longest problem text kept */
const MAX_PROBLEM = 1000;

/** An error to log */
export interface ErrorEntry {
  readonly source: ErrorSource;
  readonly code: string;
  readonly title: string;
  readonly problem: string;
  readonly path: string;
}

/** The error log: distinct errors counted, kept 90 days after they last happened, and cleared by the super admin */
@Injectable()
export class ErrorLogsService {
  private readonly logger = new Logger(ErrorLogsService.name);

  constructor(
    @InjectRepository(ErrorLog) private readonly logs: Repository<ErrorLog>,
  ) {}

  /** Logs an error, or counts it again; never throws, so logging can't cause errors of its own */
  async add(entry: ErrorEntry, now = new Date()): Promise<void> {
    const problem = entry.problem.slice(0, MAX_PROBLEM);
    const path = entry.path.split('?')[0].slice(0, 200);
    const title = entry.title.slice(0, 120);
    const fingerprint = createHash('sha256')
      .update([entry.source, entry.code, title, problem, path].join('\n'))
      .digest('hex');
    try {
      await this.logs.query(
        `INSERT INTO error_logs (fingerprint, source, code, title, problem, path, first_seen, last_seen)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
         ON CONFLICT (fingerprint) DO UPDATE SET count = error_logs.count + 1, last_seen = $7`,
        [
          fingerprint,
          entry.source,
          entry.code.slice(0, 20),
          title,
          problem,
          path,
          now,
        ],
      );
      await this.logs.delete({
        lastSeen: LessThan(new Date(now.getTime() - KEEP_DAYS * DAY_MS)),
      });
    } catch (error) {
      this.logger.error(
        `Error not logged: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    }
  }

  /** The latest errors first */
  list(): Promise<ErrorLog[]> {
    return this.logs.find({ order: { lastSeen: 'DESC' }, take: 500 });
  }

  async remove(id: string): Promise<void> {
    await this.logs.delete({ id });
  }

  async clear(): Promise<void> {
    await this.logs.clear();
  }
}
