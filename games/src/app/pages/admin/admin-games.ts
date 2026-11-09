import { afterNextRender, ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminApi } from '../../core/admin-api';
import { FeatureFlags } from '../../core/feature-flags';
import { FEATURES, FeatureId } from '../../core/features';
import { GameAvailability } from '../../core/game-availability';
import { GAMES, GameSlug } from '../../core/games';
import { SiteLanguage } from '../../i18n/site-language';

import { saveFailedNotice } from './save-failed-notice';

/**
 * Super admin tab: an on/off switch for the public per game and per feature. The switches are read again when the tab
 * opens, so they are always the API's, not what this page loaded earlier.
 */
@Component({
  selector: 'app-admin-games',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-games.html',
  styleUrls: ['./admin.scss', '../../shared/switch.scss'],
})
export class AdminGames {
  protected readonly admin = inject(AdminApi);
  protected readonly availability = inject(GameAvailability);
  protected readonly flags = inject(FeatureFlags);
  /** Site features (like rooms), and each game's multiplayer switch, shown apart */
  protected readonly features = FEATURES.filter(({ roomGame }) => !roomGame);
  protected readonly roomGames = FEATURES.filter(({ roomGame }) => roomGame);
  /** Game names in the site's language */
  protected readonly t = inject(SiteLanguage).messages;
  protected readonly games = GAMES;
  /** The game or feature being switched, while the API answers */
  protected readonly saving = signal<GameSlug | FeatureId | null>(null);
  private readonly notifySaveFailed = saveFailedNotice();

  constructor() {
    afterNextRender(() => Promise.all([this.availability.refresh(), this.flags.refresh()]));
  }

  protected toggle(game: GameSlug, event: Event): Promise<void> {
    return this.save(
      game,
      event,
      () => this.admin.setGameEnabled(game, !this.availability.isOpen(game)),
      () => this.availability.refresh(),
      () => this.availability.isOpen(game),
    );
  }

  protected toggleFeature(feature: FeatureId, event: Event): Promise<void> {
    return this.save(
      feature,
      event,
      () => this.admin.setFeatureEnabled(feature, !this.flags.isOpen(feature)),
      () => this.flags.refresh(),
      () => this.flags.isOpen(feature),
    );
  }

  /**
   * Saves a switch, reads the switches again, and sets the box to what the API now says: the box flips itself when
   * clicked, so it would otherwise disagree with the API after a failed save
   */
  private async save(
    id: GameSlug | FeatureId,
    event: Event,
    request: () => Promise<boolean>,
    reload: () => Promise<void>,
    isOpen: () => boolean,
  ): Promise<void> {
    const box = event.target instanceof HTMLInputElement ? event.target : null;
    if (this.saving()) {
      if (box) {
        box.checked = isOpen();
      }
      return;
    }
    this.saving.set(id);
    if (await request()) {
      await reload();
    } else {
      this.notifySaveFailed();
    }
    if (box) {
      box.checked = isOpen();
    }
    this.saving.set(null);
  }
}
