import { computed, inject, Injectable, signal } from '@angular/core';
import { AdminApi } from './admin-api';
import { GAMES, GameSlug } from './games';
import { GamesApi } from './games-api';
import { readStored, writeStored } from './site-storage';

/** This browser is the admin's and shows every game, open or not */
const PREVIEW_STORAGE = 'admin-preview';

/**
 * Which games are open to the public. Each game has a default in core/games.ts; the admin can switch any game on or
 * off from the admin page, stored in the API. Hidden games leave the lists and their pages send visitors home,
 * except in preview mode: the super admin's and testers' way to try them.
 *
 * Until the switches are known the games open by default show, so prerendered pages list them and nothing jumps when
 * the switches arrive; keep the defaults in step with the live switches, so the lists rarely change then. When the API
 * can't be reached, the defaults stay. The site shell starts loading after its first render.
 */
@Injectable({ providedIn: 'root' })
export class GameAvailability {
  private readonly api = inject(GamesApi);
  private readonly admin = inject(AdminApi);
  private readonly switches = signal<ReadonlyMap<GameSlug, boolean>>(new Map());
  private loading: Promise<void> | null = null;

  readonly isPreview = signal(false);
  /** Whether the switches are known (or the API gave up and the defaults apply) */
  readonly isKnown = signal(false);

  readonly openGames = computed<readonly GameSlug[]>(() =>
    GAMES.filter(({ slug, openByDefault }) => this.switches().get(slug) ?? openByDefault).map(({ slug }) => slug),
  );

  /** Games this visitor sees: the open ones (the defaults until the switches are known), or all of them in preview */
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
    const wantsPreview = readStored(PREVIEW_STORAGE) === true;
    const [switches, previewAllowed] = await Promise.all([
      this.api.gameSwitches(),
      wantsPreview ? this.previewAllowed() : Promise.resolve(false),
    ]);
    this.isPreview.set(previewAllowed);
    if (wantsPreview && !previewAllowed) {
      writeStored(PREVIEW_STORAGE, false);
    }
    // Without an answer the switches known so far stay (the defaults on a first load)
    if (switches) {
      this.switches.set(new Map(switches.map(({ game, enabled }) => [game, enabled])));
    }
    this.isKnown.set(true);
  }

  /**
   * Preview is only for a signed-in super admin or tester, checked with the API (a flag in the browser alone isn't
   * enough); when the API can't be reached, the browser's flag is trusted until it can
   */
  private async previewAllowed(): Promise<boolean> {
    const session = await this.admin.restore();
    return session === 'offline' || this.admin.canPreview();
  }
}
