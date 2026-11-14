import { afterNextRender, ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminApi } from '../../../core/admin-api';
import { FeatureFlags } from '../../../core/feature-flags';
import { FEATURES, FeatureId } from '../../../core/features';
import { GameAvailability } from '../../../core/game-availability';
import { byCategory, GAME_CATEGORIES, GAME_SLUGS, GameCategory, gameInfo, GameSlug } from '../../../core/games';

import { shrinkImage } from '../../../core/shrink-image';
import { saveFailedNotice } from '../save-failed-notice';
import { TranslatePipe } from '../../../i18n/translate-pipe';

interface SwitchActions {
  readonly isOpen: () => boolean;
  readonly setOpen: (open: boolean) => void;
  readonly request: (open: boolean) => Promise<boolean>;
}

@Component({
  selector: 'app-admin-games',
  host: { class: 'admin-tab' },
  imports: [TranslatePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-games.html',
  styleUrls: ['../admin.scss', '../../../shared/switch.scss'],
})
export class AdminGames {
  protected readonly admin = inject(AdminApi);
  protected readonly availability = inject(GameAvailability);
  protected readonly flags = inject(FeatureFlags);
  protected readonly features = FEATURES.filter(({ roomGame }) => !roomGame);
  protected readonly roomGames = FEATURES.filter(({ roomGame }) => roomGame);
  protected readonly categories = byCategory(GAME_SLUGS);
  protected readonly allCategories = GAME_CATEGORIES;
  protected readonly gameInfo = gameInfo;
  protected readonly saving = signal<ReadonlySet<GameSlug | FeatureId>>(new Set());
  private readonly notifySaveFailed = saveFailedNotice();

  constructor() {
    afterNextRender(() => Promise.all([this.availability.refresh(), this.flags.refresh()]));
  }

  protected toggle(game: GameSlug, event: Event): Promise<void> {
    return this.save(game, event, {
      isOpen: () => this.availability.isOpen(game),
      setOpen: (open) => this.availability.setOpen(game, open),
      request: (open) => this.admin.setGameEnabled(game, open),
    });
  }

  protected async toggleCategory(game: GameSlug, category: GameCategory): Promise<void> {
    const before = this.availability.categoriesOf(game);
    const after = before.includes(category)
      ? before.filter((chosen) => chosen !== category)
      : GAME_CATEGORIES.filter((known) => known === category || before.includes(known));
    if (after.length === 0 || this.saving().has(game)) {
      return;
    }
    this.saving.update((saving) => new Set(saving).add(game));
    this.availability.setCategories(game, after);
    if (!(await this.admin.setGameCategories(game, after))) {
      this.availability.setCategories(game, before);
      this.notifySaveFailed();
    }
    this.saving.update((saving) => new Set([...saving].filter((other) => other !== game)));
  }

  protected async uploadThumbnail(game: GameSlug, event: Event): Promise<void> {
    const input = event.target instanceof HTMLInputElement ? event.target : null;
    const file = input?.files?.[0];
    if (!input || !file) {
      return;
    }
    await this.whileSaving(game, async () => {
      const saved = await shrinkImage(file).then((picture) => this.admin.setGameThumbnail(game, picture), () => false);
      if (saved) {
        this.availability.setThumbnail(game, Date.now());
      } else {
        this.notifySaveFailed();
      }
    });
    input.value = '';
  }

  protected removeThumbnail(game: GameSlug): Promise<void> {
    return this.whileSaving(game, async () => {
      if (await this.admin.removeGameThumbnail(game)) {
        this.availability.setThumbnail(game, null);
      } else {
        this.notifySaveFailed();
      }
    });
  }

  private async whileSaving(id: GameSlug, work: () => Promise<void>): Promise<void> {
    if (this.saving().has(id)) {
      return;
    }
    this.saving.update((saving) => new Set(saving).add(id));
    await work();
    this.saving.update((saving) => new Set([...saving].filter((other) => other !== id)));
  }

  protected toggleFeature(feature: FeatureId, event: Event): Promise<void> {
    return this.save(feature, event, {
      isOpen: () => this.flags.isOpen(feature),
      setOpen: (open) => this.flags.setOpen(feature, open),
      request: (open) => this.admin.setFeatureEnabled(feature, open),
    });
  }

  private async save(id: GameSlug | FeatureId, event: Event, { isOpen, setOpen, request }: SwitchActions): Promise<void> {
    const box = event.target instanceof HTMLInputElement ? event.target : null;
    if (this.saving().has(id)) {
      if (box) {
        box.checked = isOpen();
      }
      return;
    }
    const open = !isOpen();
    this.saving.update((saving) => new Set(saving).add(id));
    setOpen(open);
    if (!(await request(open))) {
      setOpen(!open);
      this.notifySaveFailed();
    }
    if (box) {
      box.checked = isOpen();
    }
    this.saving.update((saving) => new Set([...saving].filter((other) => other !== id)));
  }
}
