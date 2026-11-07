import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminApi } from '../../core/admin-api';
import { GameAvailability } from '../../core/game-availability';
import { GAMES, GameSlug } from '../../core/games';
import { SiteLanguage } from '../../i18n/site-language';

/** Admin tab: preview mode, and an on/off switch per game for the public */
@Component({
  selector: 'app-admin-games',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-games.html',
  styleUrl: './admin.scss',
})
export class AdminGames {
  protected readonly admin = inject(AdminApi);
  protected readonly availability = inject(GameAvailability);
  /** Game names in the site's language */
  protected readonly t = inject(SiteLanguage).messages;
  protected readonly games = GAMES;
  /** The game being switched, while the API answers */
  protected readonly saving = signal<GameSlug | null>(null);
  protected readonly saveFailed = signal(false);

  protected togglePreview(): void {
    this.availability.setPreview(!this.availability.isPreview());
  }

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
}
