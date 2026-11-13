import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AdminApi, REPORT_STATUSES, ReportStatus, WordReport } from '../../../core/admin-api';
import { TranslatePipe } from '../../../i18n/translate-pipe';
import { PagedList } from '../paged-list';
import { saveFailedNotice } from '../save-failed-notice';

@Component({
  selector: 'app-admin-word-reports',
  host: { class: 'admin-tab' },
  imports: [TranslatePipe],
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

  constructor() {
    void this.list.reload();
  }

  protected show(status: ReportStatus): void {
    this.status.set(status);
    void this.list.reload();
  }

  protected async decide(report: WordReport, status: 'approved' | 'rejected'): Promise<void> {
    if (await this.admin.decideWord(report, status)) {
      this.list.remove(report);
    } else {
      this.notifySaveFailed();
    }
  }
}
