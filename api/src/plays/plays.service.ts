import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GAME_SLUGS, GameSlug } from '../shared/catalog.js';
import { today } from '../shared/day.js';
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
    const totals = new Map(
      rows.map(({ game, plays }) => [game, Number(plays)]),
    );
    return GAME_SLUGS.map((game) => ({ game, plays: totals.get(game) ?? 0 }));
  }
}
