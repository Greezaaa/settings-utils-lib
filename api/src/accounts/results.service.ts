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
  /** null for a player who chose not to show: ranked, but under no name */
  readonly screenName: string | null;
  readonly plays: number;
  readonly best: number;
  readonly isMe: boolean;
}

export interface Leaderboard {
  readonly key: string;
  /** Everyone ranked on this board, and the games they finished, so visitors see how much it's played */
  readonly players: number;
  readonly plays: number;
  /** The best players */
  readonly entries: LeaderboardEntry[];
  /** The player asking, when they're ranked below the best players */
  readonly me: LeaderboardEntry | null;
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
   * A game's leaderboards: the best players for each of its settings, the most played settings first, and the asking
   * player's own place below them. Only players who chose to appear are ranked, unless `withHidden` (the public
   * leaderboards): then everyone is, those who chose not to appear under no name. A best kept from before the account
   * (merged with no plays counted) still counts as one game played.
   */
  async leaderboards(
    game: ResultGame,
    playerId: string | null,
    withHidden: boolean,
  ): Promise<Leaderboard[]> {
    const order = RESULT_DIRECTIONS[game] === 'higher' ? 'DESC' : 'ASC';
    const rows: {
      key: string;
      place: string;
      screen_name: string;
      shown: boolean;
      plays: number;
      best: number;
      player_id: string;
      players: string;
      total_plays: string;
    }[] = await this.results.query(
      `SELECT * FROM (
         SELECT r.key, GREATEST(r.plays, 1) AS plays, r.best, r.player_id, p.screen_name,
                p.show_on_leaderboard AS shown,
                ROW_NUMBER() OVER (PARTITION BY r.key ORDER BY r.best ${order}, r.updated ASC) AS place,
                COUNT(*) OVER (PARTITION BY r.key) AS players,
                SUM(GREATEST(r.plays, 1)) OVER (PARTITION BY r.key) AS total_plays
         FROM player_results r JOIN players p ON p.id = r.player_id
         WHERE r.game = $1 AND ($3 OR p.show_on_leaderboard) AND NOT p.removed_from_boards
       ) ranked
       WHERE place <= $2 OR player_id = $4
       ORDER BY players DESC, key ASC, place ASC`,
      [game, LEADERBOARD_SIZE, withHidden, playerId],
    );
    const boards = new Map<string, Leaderboard>();
    for (const row of rows) {
      const board = boards.get(row.key) ?? {
        key: row.key,
        players: Number(row.players),
        plays: Number(row.total_plays),
        entries: [],
        me: null,
      };
      const entry: LeaderboardEntry = {
        place: Number(row.place),
        screenName: row.shown ? row.screen_name : null,
        plays: row.plays,
        best: row.best,
        isMe: row.player_id === playerId,
      };
      boards.set(
        row.key,
        entry.place <= LEADERBOARD_SIZE
          ? { ...board, entries: [...board.entries, entry] }
          : { ...board, me: entry },
      );
    }
    return [...boards.values()].slice(0, MAX_BOARDS);
  }
}
