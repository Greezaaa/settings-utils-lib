import { afterNextRender, ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminApi } from '../../../core/admin-api';
import { FeatureFlags } from '../../../core/feature-flags';
import { FEATURES, FeatureId } from '../../../core/features';
import { GameAvailability } from '../../../core/game-availability';
import { byCategory, GAME_SLUGS, gameInfo, GameSlug } from '../../../core/games';

import { saveFailedNotice } from '../save-failed-notice';
import { TranslatePipe } from '../../../i18n/translate-pipe';

/** How a switch is read, set on the page, and saved */
interface SwitchActions {
  readonly isOpen: () => boolean;
  readonly setOpen: (open: boolean) => void;
  readonly request: (open: boolean) => Promise<boolean>;
}

/**
 * Super admin tab: an on/off switch for the public per game and per feature. The switches are read again when the tab
 * opens, so they are always the API's, not what this page loaded earlier.
 */
@Component({
  selector: 'app-admin-games',
  imports: [TranslatePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-games.html',
  styleUrls: ['../admin.scss', '../../../shared/switch.scss'],
})
export class AdminGames {
  protected readonly admin = inject(AdminApi);
  protected readonly availability = inject(GameAvailability);
  protected readonly flags = inject(FeatureFlags);
  /** Site features (like rooms), and each game's multiplayer switch, shown apart */
  protected readonly features = FEATURES.filter(({ roomGame }) => !roomGame);
  protected readonly roomGames = FEATURES.filter(({ roomGame }) => roomGame);
  /** Every game, grouped by category as the site lists them */
  protected readonly categories = byCategory(GAME_SLUGS);
  protected readonly gameInfo = gameInfo;
  /** The games and features being switched, while the API answers */
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

  /**
   * Flips a switch straight away and saves it in the background; only that switch waits, and it flips back when the
   * save fails. Nothing else on the page reloads.
   */
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
