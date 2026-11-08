import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminApi } from '../../core/admin-api';
import { FeatureFlags } from '../../core/feature-flags';
import { FEATURES, FeatureId } from '../../core/features';
import { GameAvailability } from '../../core/game-availability';
import { GAMES, GameSlug } from '../../core/games';
import { SiteLanguage } from '../../i18n/site-language';

/** Super admin tab: an on/off switch for the public per game and per feature */
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
  protected readonly saveFailed = signal(false);

  protected async toggle(game: GameSlug): Promise<void> {
    if (this.saving()) {
      return;
    }
    this.saving.set(game);
    this.saveFailed.set(false);
    const saved = await this.admin.setGameEnabled(game, !this.availability.isOpen(game));
    if (saved) {
      await this.availability.refresh();
    }
    this.saveFailed.set(!saved);
    this.saving.set(null);
  }

  protected async toggleFeature(feature: FeatureId): Promise<void> {
    if (this.saving()) {
      return;
    }
    this.saving.set(feature);
    this.saveFailed.set(false);
    const saved = await this.admin.setFeatureEnabled(feature, !this.flags.isOpen(feature));
    if (saved) {
      await this.flags.refresh();
    }
    this.saveFailed.set(!saved);
    this.saving.set(null);
  }
}
