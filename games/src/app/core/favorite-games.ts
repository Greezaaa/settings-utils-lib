import { afterNextRender, Injectable, signal } from '@angular/core';
import { GameSlug } from './games';
import { isGameSlug } from './games-api';
import { readStored, writeStored } from './site-storage';

const STORAGE = 'favorite-games';

export function readFavorites(stored: unknown): GameSlug[] {
  return Array.isArray(stored) ? [...new Set(stored.filter((item: unknown) => isGameSlug(item)))] : [];
}

@Injectable({ providedIn: 'root' })
export class FavoriteGames {
  private readonly slugs = signal<readonly GameSlug[]>([]);

  readonly games = this.slugs.asReadonly();

  constructor() {
    afterNextRender(() => this.slugs.set(readFavorites(readStored(STORAGE))));
  }

  has(game: GameSlug): boolean {
    return this.slugs().includes(game);
  }

  toggle(game: GameSlug): void {
    this.set(this.has(game) ? this.slugs().filter((slug) => slug !== game) : [game, ...this.slugs()]);
  }

  set(games: readonly GameSlug[]): void {
    this.slugs.set(games);
    writeStored(STORAGE, games);
  }
}
