import { DOCUMENT, inject, Injectable } from '@angular/core';
import { credentialedFetch, field, isNumber, READ_TIMEOUT_MS } from './api-url';
import { ResultGame } from './player-results';

/** Players shown per leaderboard; keep in sync with LEADERBOARD_SIZE in api/src/accounts/results.service.ts */
export const LEADERBOARD_SIZE = 10;

export interface LeaderboardEntry {
  readonly place: number;
  readonly screenName: string | null;
  readonly plays: number;
  readonly best: number;
  readonly isMe: boolean;
}

export interface Leaderboard {
  readonly key: string;
  readonly players: number;
  readonly plays: number;
  readonly entries: readonly LeaderboardEntry[];
  readonly me: LeaderboardEntry | null;
}

function parseEntry(item: unknown): LeaderboardEntry[] {
  const [place, screenName, plays, best, isMe] = ['place', 'screenName', 'plays', 'best', 'isMe'].map((name) =>
    field(item, name),
  );
  return isNumber(place) &&
    (typeof screenName === 'string' || screenName === null) &&
    isNumber(plays) &&
    isNumber(best) &&
    typeof isMe === 'boolean'
    ? [{ place, screenName, plays, best, isMe }]
    : [];
}

function parseBoard(item: unknown): Leaderboard[] {
  const [key, players, plays, entries] = ['key', 'players', 'plays', 'entries'].map((name) => field(item, name));
  const [me] = parseEntry(field(item, 'me'));
  return typeof key === 'string' && isNumber(players) && isNumber(plays) && Array.isArray(entries)
    ? [{ key, players, plays, entries: entries.flatMap((entry: unknown) => parseEntry(entry)), me: me ?? null }]
    : [];
}

@Injectable({ providedIn: 'root' })
export class Leaderboards {
  private readonly document = inject(DOCUMENT);

  async of(game: ResultGame): Promise<Leaderboard[] | null> {
    const response = await credentialedFetch(this.document, `/v1/leaderboard/${game}`, {}, READ_TIMEOUT_MS, 'api');
    const boards = field(response?.ok ? await response.json() : null, 'boards');
    return Array.isArray(boards) ? boards.flatMap((board: unknown) => parseBoard(board)) : null;
  }
}
