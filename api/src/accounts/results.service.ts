import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RESULT_DIRECTIONS, ResultGame } from '../shared/catalog.js';
import type { ResultInput } from './accounts.schema.js';
import { PlayerResult } from './player-result.entity.js';

/** Players shown per leaderboard, and leaderboards (settings) shown per game */
const LEADERBOARD_SIZE = 10;
const MAX_BOARDS = 12;

/** One of a player's results, as their account gives it back */
export interface MyResult {
  readonly game: string;
  readonly key: string;
  readonly plays: number;
  readonly best: number;
}

export interface LeaderboardEntry {
  readonly place: number;
  readonly screenName: string;
  readonly plays: number;
  readonly best: number;
  readonly isMe: boolean;
}

export interface Leaderboard {
  readonly key: string;
  readonly entries: LeaderboardEntry[];
}

/** SQL keeping the better of the stored best and a new value; directions come from the catalog, never a request */
const betterOf = (game: ResultGame): string =>
  RESULT_DIRECTIONS[game] === 'higher' ? 'GREATEST' : 'LEAST';

/** Games where a higher result is better; the others keep the lower one */
const HIGHER_GAMES = Object.entries(RESULT_DIRECTIONS)
  .filter(([, direction]) => direction === 'higher')
  .map(([game]) => game);

/**
 * One result per game and settings, the better one when a list repeats a key: a single insert can't change the same
 * row twice
 */
export function betterPerKey(bests: readonly ResultInput[]): ResultInput[] {
  const byKey = new Map<string, ResultInput>();
  for (const best of bests) {
    const id = `${best.game}\n${best.key}`;
    const other = byKey.get(id);
    const isHigher = RESULT_DIRECTIONS[best.game] === 'higher';
    if (
      !other ||
      (isHigher ? best.value > other.value : best.value < other.value)
    ) {
      byKey.set(id, best);
    }
  }
  return [...byKey.values()];
}

/** Players' results per game and settings: finished games counted, best results kept, and the leaderboards */
@Injectable()
export class ResultsService {
  constructor(
    @InjectRepository(PlayerResult)
    private readonly results: Repository<PlayerResult>,
  ) {}

  /** A finished game: one more play, and a new best when it's better */
  async record(
    playerId: string,
    { game, key, value }: ResultInput,
  ): Promise<void> {
    await this.results.query(
      `INSERT INTO player_results (player_id, game, key, plays, best) VALUES ($1, $2, $3, 1, $4)
       ON CONFLICT (player_id, game, key) DO UPDATE
       SET plays = player_results.plays + 1, best = ${betterOf(game)}(player_results.best, $4), updated = now()`,
      [playerId, game, key, value],
    );
  }

  /** Best results from before signing in: kept when better, without counting plays; one query for all of them */
  async mergeBests(
    playerId: string,
    bests: readonly ResultInput[],
  ): Promise<void> {
    const merged = betterPerKey(bests);
    if (merged.length === 0) {
      return;
    }
    await this.results.query(
      `INSERT INTO player_results (player_id, game, key, plays, best)
       SELECT $1, game, key, 0, best FROM unnest($2::varchar[], $3::varchar[], $4::int[]) AS b(game, key, best)
       ON CONFLICT (player_id, game, key) DO UPDATE SET best = CASE
         WHEN player_results.game = ANY($5::varchar[]) THEN GREATEST(player_results.best, EXCLUDED.best)
         ELSE LEAST(player_results.best, EXCLUDED.best)
       END`,
      [
        playerId,
        merged.map(({ game }) => game),
        merged.map(({ key }) => key),
        merged.map(({ value }) => value),
        HIGHER_GAMES,
      ],
    );
  }

  /** Deletes a player's results: their plays, bests and places on the leaderboards; the account stays */
  async clear(playerId: string): Promise<void> {
    await this.results.delete({ playerId });
  }

  async mine(playerId: string): Promise<MyResult[]> {
    const rows = await this.results.find({
      where: { playerId },
      order: { game: 'ASC', key: 'ASC' },
    });
    return rows.map(({ game, key, plays, best }) => ({
      game,
      key,
      plays,
      best,
    }));
  }

  /**
   * A game's leaderboards: the best players for each of its settings, the most played settings first. Only players
   * who chose to appear are ranked; the others don't count, not even for their own places.
   */
  async leaderboards(
    game: ResultGame,
    playerId: string,
  ): Promise<Leaderboard[]> {
    const order = RESULT_DIRECTIONS[game] === 'higher' ? 'DESC' : 'ASC';
    const rows: {
      key: string;
      place: string;
      screen_name: string;
      plays: number;
      best: number;
      player_id: string;
      players: string;
    }[] = await this.results.query(
      `SELECT * FROM (
         SELECT r.key, r.plays, r.best, r.player_id, p.screen_name,
                ROW_NUMBER() OVER (PARTITION BY r.key ORDER BY r.best ${order}, r.updated ASC) AS place,
                COUNT(*) OVER (PARTITION BY r.key) AS players
         FROM player_results r JOIN players p ON p.id = r.player_id
         WHERE r.game = $1 AND p.show_on_leaderboard
       ) ranked
       WHERE place <= $2
       ORDER BY players DESC, key ASC, place ASC`,
      [game, LEADERBOARD_SIZE],
    );
    const boards = new Map<string, LeaderboardEntry[]>();
    for (const row of rows) {
      const entries = boards.get(row.key) ?? [];
      entries.push({
        place: Number(row.place),
        screenName: row.screen_name,
        plays: row.plays,
        best: row.best,
        isMe: row.player_id === playerId,
      });
      boards.set(row.key, entries);
    }
    return [...boards]
      .slice(0, MAX_BOARDS)
      .map(([key, entries]) => ({ key, entries }));
  }
}
