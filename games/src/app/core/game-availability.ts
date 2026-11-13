import { computed, inject, Injectable, signal } from '@angular/core';
import { AdminApi } from './admin-api';
import { GAMES, GameSlug } from './games';
import { GamesApi, isGameSlug } from './games-api';
import { readSwitches, writeSwitches } from './remembered-switches';
import { readStored, writeStored } from './site-storage';

const PREVIEW_STORAGE = 'admin-preview';
const SWITCHES_STORAGE = 'game-switches';

@Injectable({ providedIn: 'root' })
export class GameAvailability {
  private readonly api = inject(GamesApi);
  private readonly admin = inject(AdminApi);
  private readonly switches = signal<ReadonlyMap<GameSlug, boolean>>(new Map());
  private loading: Promise<void> | null = null;

  readonly isPreview = signal(false);
  readonly isKnown = signal(false);

  readonly openGames = computed<readonly GameSlug[]>(() =>
    GAMES.filter(({ slug, openByDefault }) => this.switches().get(slug) ?? openByDefault).map(({ slug }) => slug),
  );

  readonly visibleGames = computed<readonly GameSlug[]>(() =>
    this.isPreview() ? GAMES.map(({ slug }) => slug) : this.openGames(),
  );

  isOpen(game: GameSlug): boolean {
    return this.openGames().includes(game);
  }

  canPlay(game: GameSlug): boolean {
    return this.visibleGames().includes(game);
  }

  ready(): Promise<void> {
    this.loading ??= this.load();
    return this.loading;
  }

  setOpen(game: GameSlug, open: boolean): void {
    this.switches.update((switches) => new Map(switches).set(game, open));
  }

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
    if (switches) {
      const known = new Map(switches.map(({ game, enabled }) => [game, enabled]));
      this.switches.set(known);
      writeSwitches(SWITCHES_STORAGE, known);
    } else {
      this.switches.set(readSwitches(SWITCHES_STORAGE, isGameSlug) ?? this.switches());
    }
    this.isKnown.set(true);
  }

  private async previewAllowed(): Promise<boolean> {
    const session = await this.admin.restore();
    return session === 'offline' || this.admin.canPreview();
  }
}
