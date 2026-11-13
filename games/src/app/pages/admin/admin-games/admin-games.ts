import { afterNextRender, ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminApi } from '../../../core/admin-api';
import { FeatureFlags } from '../../../core/feature-flags';
import { FEATURES, FeatureId } from '../../../core/features';
import { GameAvailability } from '../../../core/game-availability';
import { byCategory, GAME_SLUGS, gameInfo, GameSlug } from '../../../core/games';

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
