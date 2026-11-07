import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AdminApi, REPORT_STATUSES, ReportStatus, WordReport } from '../../core/admin-api';
import { SiteLanguage } from '../../i18n/site-language';

/**
 * Admin tab: words players reported in the word builder. A word reported 3 times stops counting until decided:
 * keep it out for good, or let it count again.
 */
@Component({
  selector: 'app-admin-word-reports',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-word-reports.html',
  styleUrl: './admin.scss',
})
export class AdminWordReports {
  private readonly admin = inject(AdminApi);

  protected readonly statuses = REPORT_STATUSES;
  /** Texts in the site's language */
  protected readonly t = inject(SiteLanguage).messages;
  protected readonly status = signal<ReportStatus>('pending');
  protected readonly reports = signal<readonly WordReport[]>([]);
  protected readonly loading = signal(true);
  protected readonly failed = signal(false);

  constructor() {
    void this.load();
  }

  protected show(status: ReportStatus): void {
    this.status.set(status);
    void this.load();
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.reports.set(await this.admin.wordReports(this.status()));
    this.loading.set(false);
  }

  protected async decide(report: WordReport, status: 'approved' | 'rejected'): Promise<void> {
    const saved = await this.admin.decideWord(report, status);
    this.failed.set(!saved);
    if (saved) {
      await this.load();
    }
  }
}
