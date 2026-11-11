import { afterNextRender, computed, inject, Injectable, signal } from '@angular/core';
import { GameSlug } from './games';
import { GamePlays, GamesApi } from './games-api';

/** At most this many games are marked "Most played", the most played ones */
export const POPULAR_GAMES_LIMIT = 3;
/** Plays in the last 30 days a game needs before it can be marked "Most played", so a couple of plays mean nothing */
export const MIN_POPULAR_PLAYS = 5;

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
 * Always `count` games when there are enough: the most played first, then the rest in site order. The section keeps
 * its size from the prerendered page on, so the page doesn't jump when the play counts arrive.
 */
export function toppedUp(mostPlayed: readonly GameSlug[], all: readonly GameSlug[], count = MOST_PLAYED_LIMIT): GameSlug[] {
  return [...new Set([...mostPlayed, ...all])].slice(0, count);
}

/**
 * From the API's play counts: the games to mark "Most played", and the most played ones for the home page; none when the
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
