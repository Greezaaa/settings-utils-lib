import { computed, inject, Injectable, signal } from '@angular/core';
import { GAMES, GameSlug } from './games';
import { GamesApi } from './games-api';
import { readStored, writeStored } from './site-storage';

/** This browser is the admin's and shows every game, open or not */
const PREVIEW_STORAGE = 'admin-preview';

/**
 * Which games are open to the public. Each game has a default in core/games.ts; the admin can switch any game on or
 * off from the admin page, stored in the API. Hidden games leave the lists and their pages send visitors home,
 * except in preview mode, the admin's way to try them.
 *
 * Until the API answers (and whenever it can't be reached) the defaults apply, so prerendered pages list the games
 * that are open by default. The site shell starts loading after its first render; game pages wait for it.
 */
@Injectable({ providedIn: 'root' })
export class GameAvailability {
  private readonly api = inject(GamesApi);
  private readonly switches = signal<ReadonlyMap<GameSlug, boolean>>(new Map());
  private loading: Promise<void> | null = null;

  /** Whether this browser is in the admin's preview mode */
  readonly isPreview = signal(false);

  /** Games open to the public */
  readonly openGames = computed<readonly GameSlug[]>(() =>
    GAMES.filter(({ slug, openByDefault }) => this.switches().get(slug) ?? openByDefault).map(({ slug }) => slug),
  );

  /** Games this visitor sees: the open ones, or all of them in preview */
  readonly visibleGames = computed<readonly GameSlug[]>(() =>
    this.isPreview() ? GAMES.map(({ slug }) => slug) : this.openGames(),
  );

  isOpen(game: GameSlug): boolean {
    return this.openGames().includes(game);
  }

  canPlay(game: GameSlug): boolean {
    return this.visibleGames().includes(game);
  }

  /** Resolves once the preview flag and the admin's switches are known (or the API gave up); browser only */
  ready(): Promise<void> {
    this.loading ??= this.load();
    return this.loading;
  }

  /** Reads the switches again, e.g. after the admin changed one */
  async refresh(): Promise<void> {
    this.loading = this.load();
    await this.loading;
  }

  setPreview(preview: boolean): void {
    this.isPreview.set(preview);
    writeStored(PREVIEW_STORAGE, preview);
  }

  private async load(): Promise<void> {
    this.isPreview.set(readStored(PREVIEW_STORAGE) === true);
    const switches = await this.api.gameSwitches();
    this.switches.set(new Map(switches.map(({ game, enabled }) => [game, enabled])));
  }
}
