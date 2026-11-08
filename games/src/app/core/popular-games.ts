import { afterNextRender, computed, inject, Injectable, signal } from '@angular/core';
import { GameSlug } from './games';
import { GamePlays, GamesApi } from './games-api';

/** At most this many games are marked "Popular", the most played ones */
export const POPULAR_GAMES_LIMIT = 2;
/** Plays in the last 30 days a game needs before it can be marked popular, so a handful of plays mean nothing */
export const MIN_POPULAR_PLAYS = 20;

/** The most played games, most played first, among those with enough plays */
export function popularGames(
  plays: readonly GamePlays[],
  limit = POPULAR_GAMES_LIMIT,
  minPlays = MIN_POPULAR_PLAYS,
): GameSlug[] {
  return plays
    .filter((game) => game.plays >= minPlays)
    .sort((first, second) => second.plays - first.plays)
    .slice(0, limit)
    .map(({ game }) => game);
}

/** Games in the home page's "Most popular" section */
export const MOST_PLAYED_LIMIT = 4;

/**
 * From the API's play counts: the games to mark "Popular", and the most played ones for the home page; none when the
 * API can't be reached
 */
@Injectable({ providedIn: 'root' })
export class PopularGames {
  private readonly api = inject(GamesApi);
  private readonly plays = signal<readonly GamePlays[]>([]);

  readonly games = computed(() => popularGames(this.plays()));
  readonly mostPlayed = computed(() => popularGames(this.plays(), MOST_PLAYED_LIMIT));

  constructor() {
    afterNextRender(async () => this.plays.set(await this.api.plays()));
  }
}
