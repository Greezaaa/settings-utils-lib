import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GAME_SLUGS, GameSlug } from '../shared/catalog.js';
import { today } from '../shared/day.js';
import { periodStart, StatsPeriod } from '../shared/period.js';
import { PlayCount } from './play-count.entity.js';

export interface GamePlays {
  readonly game: GameSlug;
  readonly plays: number;
}

/** Days counted for "most popular" */
export const POPULAR_DAYS = 30;

@Injectable()
export class PlaysService {
  constructor(
    @InjectRepository(PlayCount) private readonly counts: Repository<PlayCount>,
  ) {}

  /** Adds one play of a game to today's count */
  async count(game: GameSlug, day = today()): Promise<void> {
    await this.counts.query(
      `INSERT INTO play_counts (game, day, count) VALUES ($1, $2, 1)
       ON CONFLICT (game, day) DO UPDATE SET count = play_counts.count + 1`,
      [game, day],
    );
  }

  /** Plays of every game in the last `days` days, 0 for games nobody played */
  async recent(days = POPULAR_DAYS): Promise<GamePlays[]> {
    const rows: { game: string; plays: string }[] = await this.counts.query(
      `SELECT game, SUM(count) AS plays FROM play_counts WHERE day > current_date - $1::integer GROUP BY game`,
      [days],
    );
    return withEveryGame(rows);
  }

  /** Deletes every play counted, so statistics start again from today */
  async clear(): Promise<void> {
    await this.counts.clear();
  }

  /** Plays of every game in a period, for the admin page */
  async inPeriod(period: StatsPeriod, now = new Date()): Promise<GamePlays[]> {
    const start = periodStart(period, now);
    const rows: { game: string; plays: string }[] = await this.counts.query(
      `SELECT game, SUM(count) AS plays FROM play_counts WHERE $1::date IS NULL OR day >= $1::date GROUP BY game`,
      [start],
    );
    return withEveryGame(rows);
  }
}

/** Totals as numbers for every known game, 0 for games with no row */
function withEveryGame(rows: { game: string; plays: string }[]): GamePlays[] {
  const totals = new Map(rows.map(({ game, plays }) => [game, Number(plays)]));
  return GAME_SLUGS.map((game) => ({ game, plays: totals.get(game) ?? 0 }));
}
