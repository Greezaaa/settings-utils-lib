import { computed, DOCUMENT, inject, Injectable, signal } from '@angular/core';
import { AdminSession } from './admin-session';
import { apiUrl } from './api-url';
import { defaultCategories, GameCategory, GAMES, GameSlug, gameThumbnail } from './games';
import { GamesApi, isGameSlug, parseCategoryLists, parseThumbnails } from './games-api';
import { RememberedSwitches } from './remembered-switches';
import { readStored, writeStored } from './site-storage';

const PREVIEW_STORAGE = 'admin-preview';
const SWITCHES_STORAGE = 'game-switches';
const CATEGORIES_STORAGE = 'game-categories';
const THUMBNAILS_STORAGE = 'game-thumbnails';

@Injectable({ providedIn: 'root' })
export class GameAvailability {
  private readonly api = inject(GamesApi);
  private readonly admin = inject(AdminSession);
  private readonly switches = new RememberedSwitches<GameSlug>(SWITCHES_STORAGE, isGameSlug);
  private readonly categories = signal<ReadonlyMap<GameSlug, readonly GameCategory[]>>(new Map());
  private readonly thumbnails = signal<ReadonlyMap<GameSlug, number>>(new Map());
  private readonly document = inject(DOCUMENT);
  private loading: Promise<void> | null = null;
  private hasRemembered = false;

  readonly isPreview = signal(false);
  readonly isLoaded = signal(false);

  readonly openGames = computed<readonly GameSlug[]>(() =>
    GAMES.filter(({ slug, openByDefault }) => this.switches.all().get(slug) ?? openByDefault).map(({ slug }) => slug),
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

  async canEnter(game: GameSlug): Promise<boolean> {
    const loading = this.whenLoaded();
    if (this.switches.wasStored && this.canPlay(game)) {
      return true;
    }
    await loading;
    return this.canPlay(game);
  }

  categoriesOf(game: GameSlug): readonly GameCategory[] {
    return this.categories().get(game) ?? defaultCategories(game);
  }

  setCategories(game: GameSlug, categories: readonly GameCategory[]): void {
    this.categories.update((known) => new Map(known).set(game, categories));
  }

  thumbnailOf(game: GameSlug): string {
    const version = this.thumbnails().get(game);
    return version === undefined
      ? gameThumbnail(game)
      : apiUrl(this.document, `/v1/games/${game}/thumbnail?v=${version}`);
  }

  hasOwnThumbnail(game: GameSlug): boolean {
    return this.thumbnails().has(game);
  }

  setThumbnail(game: GameSlug, version: number | null): void {
    this.thumbnails.update((known) => {
      const next = new Map(known);
      if (version === null) {
        next.delete(game);
      } else {
        next.set(game, version);
      }
      return next;
    });
  }

  whenLoaded(): Promise<void> {
    this.loading ??= this.load();
    return this.loading;
  }

  setOpen(game: GameSlug, open: boolean): void {
    this.switches.set(game, open);
  }

  async reload(): Promise<void> {
    this.loading = this.load();
    await this.loading;
  }

  setPreview(preview: boolean): void {
    this.isPreview.set(preview);
    writeStored(PREVIEW_STORAGE, preview);
  }

  private async load(): Promise<void> {
    this.useRemembered();
    const wantsPreview = readStored(PREVIEW_STORAGE) === true;
    const [site, previewAllowed] = await Promise.all([
      this.api.site(),
      wantsPreview ? this.previewAllowed() : Promise.resolve(false),
    ]);
    this.isPreview.set(previewAllowed);
    if (wantsPreview && !previewAllowed) {
      writeStored(PREVIEW_STORAGE, false);
    }
    const settings = site?.games;
    if (settings) {
      this.switches.replace(new Map(settings.switches.map(({ game, enabled }) => [game, enabled])));
      this.categories.set(new Map(settings.categories.map(({ game, categories }) => [game, categories])));
      writeStored(CATEGORIES_STORAGE, settings.categories);
      this.thumbnails.set(new Map(settings.thumbnails.map(({ game, version }) => [game, version])));
      writeStored(THUMBNAILS_STORAGE, settings.thumbnails);
    }
    this.isLoaded.set(true);
  }

  private useRemembered(): void {
    if (this.hasRemembered) {
      return;
    }
    this.hasRemembered = true;
    this.switches.restore();
    this.categories.set(
      new Map(parseCategoryLists(readStored(CATEGORIES_STORAGE)).map(({ game, categories }) => [game, categories])),
    );
    this.thumbnails.set(
      new Map(parseThumbnails(readStored(THUMBNAILS_STORAGE)).map(({ game, version }) => [game, version])),
    );
  }

  private async previewAllowed(): Promise<boolean> {
    const session = await this.admin.restore();
    return session === 'offline' || this.admin.canPreview();
  }
}
