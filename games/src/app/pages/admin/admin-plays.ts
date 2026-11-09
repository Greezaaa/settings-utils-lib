import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { SuDialogService } from '@su-labs/dialog';
import { SuNotificationService } from '@su-labs/notifications';
import { AdminApi, GameFeedback, STATS_PERIODS, StatsPeriod } from '../../core/admin-api';
import { GAMES } from '../../core/games';
import { GamePlays } from '../../core/games-api';
import { SiteLanguage } from '../../i18n/site-language';
import { saveFailedNotice } from './save-failed-notice';

/**
 * Admin tab: plays per game in a chosen period, with each game's 👍/👎 and the reasons given in it; the super admin can
 * reset them
 */
@Component({
  selector: 'app-admin-plays',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-plays.html',
  styleUrl: './admin.scss',
})
export class AdminPlays {
  protected readonly admin = inject(AdminApi);
  private readonly notifications = inject(SuNotificationService);
  private readonly dialog = inject(SuDialogService);
  private readonly notifySaveFailed = saveFailedNotice();
  /** Game names and feedback reasons in the site's language */
  protected readonly t = inject(SiteLanguage).messages;

  protected readonly periods = STATS_PERIODS;
  protected readonly period = signal<StatsPeriod>('month');
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
    const period = this.period();
    const [plays, feedback] = await Promise.all([this.admin.plays(period), this.admin.feedback(period)]);
    this.plays.set(plays);
    this.feedback.set(feedback);
    this.loading.set(false);
  }

  protected choosePeriod(period: StatsPeriod): void {
    this.period.set(period);
    void this.load();
  }

  /** Super admin: deletes every play and vote, after asking, so statistics start again from today */
  protected async resetStats(): Promise<void> {
    const { resetStats, confirmResetStats } = this.t().admin;
    if (
      !(await this.dialog.confirm({
        title: resetStats,
        body: confirmResetStats,
        acceptLabel: resetStats,
        danger: true,
      }))
    ) {
      return;
    }
    if (await this.admin.resetStats()) {
      this.notifications.show({ type: 'success', message: this.t().admin.statsReset });
      await this.load();
    } else {
      this.notifySaveFailed();
    }
  }

  /** A feedback reason in the site's language, or as the API sent it if it's unknown */
  protected reasonName(reason: string): string {
    return Object.entries(this.t().feedback.reasons).find(([id]) => id === reason)?.[1] ?? reason;
  }
}
