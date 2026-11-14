import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { SuDialogService } from '@su-labs/dialog';
import { SuNotificationService } from '@su-labs/notifications';
import { SuTableColumns, SuTableComponent } from '@su-labs/table';
import { AdminApi, GameFeedback, STATS_PERIODS, StatsPeriod } from '../../../core/admin-api';
import { FeatureFlags } from '../../../core/feature-flags';
import { GAMES, GameSlug } from '../../../core/games';
import { GamePlays } from '../../../core/games-api';
import { SiteLanguage } from '../../../i18n/site-language';
import { ADMIN_TABLE_PAGE_SIZE, ADMIN_TABLE_PAGE_SIZES } from '../admin-table';
import { saveFailedNotice } from '../save-failed-notice';
import { TranslatePipe } from '../../../i18n/translate-pipe';

interface PlaysRow {
  readonly game: GameSlug;
  readonly plays: number;
  readonly up: number;
  readonly down: number;
  readonly reasons: readonly (readonly [string, number])[];
}

@Component({
  selector: 'app-admin-plays',
  host: { class: 'admin-tab' },
  imports: [TranslatePipe, SuTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-plays.html',
  styleUrl: '../admin.scss',
})
export class AdminPlays {
  protected readonly admin = inject(AdminApi);
  private readonly notifications = inject(SuNotificationService);
  private readonly dialog = inject(SuDialogService);
  private readonly notifySaveFailed = saveFailedNotice();
  protected readonly t = inject(SiteLanguage).messages;

  protected readonly periods = STATS_PERIODS;
  protected readonly period = signal<StatsPeriod>('month');
  private readonly plays = signal<readonly GamePlays[]>([]);
  private readonly feedback = signal<readonly GameFeedback[]>([]);
  protected readonly loading = signal(true);

  protected readonly rows = computed<readonly PlaysRow[]>(() =>
    GAMES.map(({ slug }): PlaysRow => {
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
  private readonly features = inject(FeatureFlags);
  protected readonly useTable = computed(() => this.features.canUse('admin-tables'));
  protected readonly pageSize = ADMIN_TABLE_PAGE_SIZE;
  protected readonly pageSizes = ADMIN_TABLE_PAGE_SIZES;
  protected readonly gameId = (row: PlaysRow): string => row.game;
  protected readonly columns = computed<SuTableColumns<PlaysRow>>(() => {
    const { admin, games } = this.t();
    return [
      { key: 'game', header: admin.playsColumns.game, sortable: true, format: game => games[game].name },
      { key: 'plays', header: admin.playsColumns.plays, sortable: true, align: 'end' },
      { key: 'up', header: '👍', sortable: true, align: 'end' },
      { key: 'down', header: '👎', sortable: true, align: 'end' },
      {
        key: 'reasons',
        header: admin.playsColumns.reasons,
        format: reasons =>
          reasons.length === 0 ? '—' : reasons.map(([reason, count]) => `${this.reasonName(reason)} (${count})`).join(', '),
      },
    ];
  });
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

  protected reasonName(reason: string): string {
    return Object.entries(this.t().feedback.reasons).find(([id]) => id === reason)?.[1] ?? reason;
  }
}
