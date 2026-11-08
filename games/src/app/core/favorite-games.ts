import { afterNextRender, Injectable, signal } from '@angular/core';
import { GameSlug } from './games';
import { isGameSlug } from './games-api';
import { readStored, writeStored } from './site-storage';

const STORAGE = 'favorite-games';

/** Favourites saved in this browser, keeping only known games, once each */
export function readFavorites(stored: unknown): GameSlug[] {
  return Array.isArray(stored) ? [...new Set(stored.filter((item: unknown) => isGameSlug(item)))] : [];
}

/**
 * The visitor's favourite games, marked with the heart on the game cards and listed first on the home page.
 * Remembered in this browser (and in their account, once signed in).
 */
@Injectable({ providedIn: 'root' })
export class FavoriteGames {
  private readonly slugs = signal<readonly GameSlug[]>([]);

  /** Most recently added first */
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

  /** Replaces the list, e.g. with the account's */
  set(games: readonly GameSlug[]): void {
    this.slugs.set(games);
    writeStored(STORAGE, games);
  }
}
