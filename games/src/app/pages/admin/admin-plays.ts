import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AdminApi, GameFeedback } from '../../core/admin-api';
import { GAMES } from '../../core/games';
import { GamePlays, GamesApi } from '../../core/games-api';
import { SiteLanguage } from '../../i18n/site-language';

/** Admin tab: plays per game over the last 30 days, with each game's 👍/👎 and the reasons given */
@Component({
  selector: 'app-admin-plays',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-plays.html',
  styleUrl: './admin.scss',
})
export class AdminPlays {
  private readonly api = inject(GamesApi);
  private readonly admin = inject(AdminApi);
  /** Game names and feedback reasons in the site's language */
  protected readonly t = inject(SiteLanguage).messages;

  private readonly plays = signal<readonly GamePlays[]>([]);
  private readonly feedback = signal<readonly GameFeedback[]>([]);
  protected readonly loading = signal(true);

  /** One row per game, most played first */
  protected readonly rows = computed(() =>
    GAMES.map(({ slug }) => {
      const feedback = this.feedback().find(({ game }) => game === slug);
      return {
        game: slug,
        plays: this.plays().find(({ game }) => game === slug)?.plays ?? 0,
        up: feedback?.up ?? 0,
        down: feedback?.down ?? 0,
        reasons: [...(feedback?.reasons ?? new Map<string, number>())].sort(([, first], [, second]) => second - first),
      };
    }).sort((first, second) => second.plays - first.plays),
  );
  protected readonly totalPlays = computed(() => this.rows().reduce((total, row) => total + row.plays, 0));

  constructor() {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    const [plays, feedback] = await Promise.all([this.api.plays(), this.admin.feedback()]);
    this.plays.set(plays);
    this.feedback.set(feedback);
    this.loading.set(false);
  }

  /** A feedback reason in the site's language, or as the API sent it if it's unknown */
  protected reasonName(reason: string): string {
    return Object.entries(this.t().feedback.reasons).find(([id]) => id === reason)?.[1] ?? reason;
  }
}
