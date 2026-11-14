import { computed, DOCUMENT, inject, Injectable, signal } from '@angular/core';
import { AdminApi } from './admin-api';
import { apiUrl } from './api-url';
import { defaultCategories, GameCategory, GAMES, GameSlug, gameThumbnail } from './games';
import { GameCategoryList, GamesApi, isGameCategory, isGameSlug, parseThumbnails } from './games-api';
import { readSwitches, writeSwitches } from './remembered-switches';
import { readStored, writeStored } from './site-storage';

const PREVIEW_STORAGE = 'admin-preview';
const SWITCHES_STORAGE = 'game-switches';
const CATEGORIES_STORAGE = 'game-categories';
const THUMBNAILS_STORAGE = 'game-thumbnails';

@Injectable({ providedIn: 'root' })
export class GameAvailability {
  private readonly api = inject(GamesApi);
  private readonly admin = inject(AdminApi);
  private readonly switches = signal<ReadonlyMap<GameSlug, boolean>>(new Map());
  private readonly categories = signal<ReadonlyMap<GameSlug, readonly GameCategory[]>>(new Map());
  private readonly thumbnails = signal<ReadonlyMap<GameSlug, number>>(new Map());
  private readonly document = inject(DOCUMENT);
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

  categoriesOf(game: GameSlug): readonly GameCategory[] {
    return this.categories().get(game) ?? defaultCategories(game);
  }

  setCategories(game: GameSlug, categories: readonly GameCategory[]): void {
    this.categories.update((known) => new Map(known).set(game, categories));
  }

  thumbnailOf(game: GameSlug): string {
    const version = this.thumbnails().get(game);
    return version === undefined ? gameThumbnail(game) : apiUrl(this.document, `/v1/games/${game}/thumbnail?v=${version}`);
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
    const [settings, previewAllowed] = await Promise.all([
      this.api.gameSettings(),
      wantsPreview ? this.previewAllowed() : Promise.resolve(false),
    ]);
    this.isPreview.set(previewAllowed);
    if (wantsPreview && !previewAllowed) {
      writeStored(PREVIEW_STORAGE, false);
    }
    if (settings) {
      const known = new Map(settings.switches.map(({ game, enabled }) => [game, enabled]));
      this.switches.set(known);
      writeSwitches(SWITCHES_STORAGE, known);
      this.categories.set(new Map(settings.categories.map(({ game, categories }) => [game, categories])));
      writeStored(CATEGORIES_STORAGE, settings.categories);
      this.thumbnails.set(new Map(settings.thumbnails.map(({ game, version }) => [game, version])));
      writeStored(THUMBNAILS_STORAGE, settings.thumbnails);
    } else {
      this.switches.set(readSwitches(SWITCHES_STORAGE, isGameSlug) ?? this.switches());
      this.categories.set(new Map(readCategories().map(({ game, categories }) => [game, categories])));
      this.thumbnails.set(new Map(parseThumbnails(readStored(THUMBNAILS_STORAGE)).map(({ game, version }) => [game, version])));
    }
    this.isKnown.set(true);
  }

  private async previewAllowed(): Promise<boolean> {
    const session = await this.admin.restore();
    return session === 'offline' || this.admin.canPreview();
  }
}

function readCategories(): GameCategoryList[] {
  const stored = readStored(CATEGORIES_STORAGE);
  if (!Array.isArray(stored)) {
    return [];
  }
  return stored.flatMap((item: unknown) => {
    const game: unknown = Reflect.get(Object(item), 'game');
    const categories: unknown = Reflect.get(Object(item), 'categories');
    const known = Array.isArray(categories) ? categories.filter((category: unknown) => isGameCategory(category)) : [];
    return isGameSlug(game) && known.length > 0 ? [{ game, categories: known }] : [];
  });
}
