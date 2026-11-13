import { afterNextRender, computed, inject, Injectable, signal } from '@angular/core';
import { GameSlug } from './games';
import { GamePlays, GamesApi } from './games-api';

export const POPULAR_GAMES_LIMIT = 3;
export const MIN_POPULAR_PLAYS = 5;

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

export const MOST_PLAYED_LIMIT = 4;

export function toppedUp(mostPlayed: readonly GameSlug[], all: readonly GameSlug[], count = MOST_PLAYED_LIMIT): GameSlug[] {
  return [...new Set([...mostPlayed, ...all])].slice(0, count);
}

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
