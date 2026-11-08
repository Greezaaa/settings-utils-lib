import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { today } from '../shared/day.js';
import { periodStart, StatsPeriod } from '../shared/period.js';
import { Feedback } from './feedback.entity.js';
import { FeedbackInput } from './feedback.schema.js';

/** Votes and reasons of one game, for moderators */
export interface FeedbackSummary {
  readonly game: string;
  readonly up: number;
  readonly down: number;
  readonly reasons: Record<string, number>;
}

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback) private readonly feedback: Repository<Feedback>,
  ) {}

  async add(
    { game, vote, reason, language }: FeedbackInput,
    day = today(),
  ): Promise<void> {
    await this.feedback.insert({
      game,
      vote,
      reason: reason ?? null,
      language,
      day,
    });
  }

  /** Every game's votes and reasons in a period */
  async summary(
    period: StatsPeriod = 'all',
    now = new Date(),
  ): Promise<FeedbackSummary[]> {
    const rows: {
      game: string;
      vote: string;
      reason: string | null;
      total: string;
    }[] = await this.feedback.query(
      `SELECT game, vote, reason, COUNT(*) AS total FROM feedback
       WHERE $1::date IS NULL OR day >= $1::date
       GROUP BY game, vote, reason ORDER BY game`,
      [periodStart(period, now)],
    );
    const byGame = new Map<
      string,
      { up: number; down: number; reasons: Record<string, number> }
    >();
    for (const { game, vote, reason, total } of rows) {
      const summary = byGame.get(game) ?? { up: 0, down: 0, reasons: {} };
      const count = Number(total);
      if (vote === 'up') {
        summary.up += count;
      } else {
        summary.down += count;
      }
      if (reason) {
        summary.reasons[reason] = (summary.reasons[reason] ?? 0) + count;
      }
      byGame.set(game, summary);
    }
    return [...byGame].map(([game, summary]) => ({ game, ...summary }));
  }
}
