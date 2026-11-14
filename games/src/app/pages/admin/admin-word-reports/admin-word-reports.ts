import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { SuTableAction, SuTableActionEvent, SuTableColumns, SuTableComponent } from '@su-labs/table';
import { AdminApi, REPORT_STATUSES, ReportStatus, WordReport } from '../../../core/admin-api';
import { FeatureFlags } from '../../../core/feature-flags';
import { SiteLanguage } from '../../../i18n/site-language';
import { TranslatePipe } from '../../../i18n/translate-pipe';
import { ADMIN_TABLE_PAGE_SIZE, ADMIN_TABLE_PAGE_SIZES } from '../admin-table';
import { PagedList } from '../paged-list';
import { saveFailedNotice } from '../save-failed-notice';

@Component({
  selector: 'app-admin-word-reports',
  host: { class: 'admin-tab' },
  imports: [TranslatePipe, SuTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-word-reports.html',
  styleUrl: '../admin.scss',
})
export class AdminWordReports {
  private readonly admin = inject(AdminApi);

  protected readonly statuses = REPORT_STATUSES;
  protected readonly status = signal<ReportStatus>('pending');
  protected readonly list = new PagedList(offset => this.admin.wordReports(this.status(), offset));
  private readonly notifySaveFailed = saveFailedNotice();
  private readonly features = inject(FeatureFlags);
  protected readonly t = inject(SiteLanguage).messages;
  protected readonly useTable = computed(() => this.features.canUse('admin-tables'));
  protected readonly pageSize = ADMIN_TABLE_PAGE_SIZE;
  protected readonly pageSizes = ADMIN_TABLE_PAGE_SIZES;
  protected readonly reportId = (report: WordReport): string => `${report.language}:${report.word}`;
  protected readonly columns = computed<SuTableColumns<WordReport>>(() => {
    const { admin } = this.t();
    return [
      { key: 'word', header: admin.reportColumns.word, sortable: true },
      { key: 'language', header: admin.reportColumns.language, sortable: true, format: language => language.toUpperCase() },
      { key: 'reports', header: admin.reportColumns.reports, sortable: true, align: 'end' },
      { key: 'firstReported', header: admin.reportColumns.firstReported, sortable: true },
    ];
  });
  protected readonly actions = computed<readonly SuTableAction<WordReport>[]>(() => {
    const { admin } = this.t();
    return [
      { id: 'approved', label: admin.keepOut, hidden: report => report.status === 'approved' },
      { id: 'rejected', label: admin.letCount, hidden: report => report.status === 'rejected' },
    ];
  });

  constructor() {
    void this.list.reload();
  }

  protected show(status: ReportStatus): void {
    this.status.set(status);
    void this.list.reload();
  }

  protected onAction({ id, rows: [report] }: SuTableActionEvent<WordReport>): void {
    if (report && (id === 'approved' || id === 'rejected')) {
      void this.decide(report, id);
    }
  }

  protected async decide(report: WordReport, status: 'approved' | 'rejected'): Promise<void> {
    if (await this.admin.decideWord(report, status)) {
      this.list.remove(report);
    } else {
      this.notifySaveFailed();
    }
  }
}
