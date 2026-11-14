import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { SuDialogService } from '@su-labs/dialog';
import { SuTableAction, SuTableActionEvent, SuTableColumns, SuTableComponent } from '@su-labs/table';
import { AdminApi, LoggedError } from '../../../core/admin-api';
import { FeatureFlags } from '../../../core/feature-flags';
import { formatMoment } from '../../../core/site-updates';
import { SiteLanguage } from '../../../i18n/site-language';
import { ADMIN_TABLE_PAGE_SIZE, ADMIN_TABLE_PAGE_SIZES } from '../admin-table';
import { saveFailedNotice } from '../save-failed-notice';
import { TranslatePipe } from '../../../i18n/translate-pipe';

@Component({
  selector: 'app-admin-errors',
  host: { class: 'admin-tab' },
  imports: [TranslatePipe, SuTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-errors.html',
  styleUrl: '../admin.scss',
})
export class AdminErrors {
  private readonly admin = inject(AdminApi);
  private readonly dialog = inject(SuDialogService);
  private readonly language = inject(SiteLanguage);
  protected readonly t = this.language.messages;
  private readonly notifySaveFailed = saveFailedNotice();

  protected readonly errors = signal<readonly LoggedError[]>([]);
  protected readonly loading = signal(true);
  private readonly features = inject(FeatureFlags);
  protected readonly useTable = computed(() => this.features.canUse('admin-tables'));
  protected readonly pageSize = ADMIN_TABLE_PAGE_SIZE;
  protected readonly pageSizes = ADMIN_TABLE_PAGE_SIZES;
  protected readonly errorId = (error: LoggedError): string => error.id;
  protected readonly columns = computed<SuTableColumns<LoggedError>>(() => {
    const { admin } = this.t();
    return [
      { key: 'lastSeen', header: admin.errorColumns.when, sortable: true, format: lastSeen => this.when(lastSeen) },
      { key: 'code', header: admin.errorColumns.code, format: (code, error) => `${admin.errorSources[error.source]} · ${code}` },
      { key: 'title', header: admin.errorColumns.title },
      { key: 'problem', header: admin.errorColumns.problem },
      { key: 'path', header: admin.errorColumns.page, sortable: true },
      { key: 'count', header: admin.errorColumns.count, sortable: true, align: 'end' },
    ];
  });
  protected readonly actions = computed<readonly SuTableAction<LoggedError>[]>(() => [
    { id: 'resolve', label: this.t().admin.resolveError },
  ]);

  constructor() {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.errors.set(await this.admin.errors());
    this.loading.set(false);
  }

  protected when(iso: string): string {
    return formatMoment(iso, this.language.language());
  }

  protected onAction({ rows: [error] }: SuTableActionEvent<LoggedError>): void {
    if (error) {
      void this.remove(error);
    }
  }

  protected async remove(error: LoggedError): Promise<void> {
    await this.afterChange(this.admin.deleteError(error.id));
  }

  protected async clear(): Promise<void> {
    const { confirmClearErrors, clearErrors } = this.t().admin;
    if (await this.dialog.confirm({ title: confirmClearErrors, acceptLabel: clearErrors, danger: true })) {
      await this.afterChange(this.admin.clearErrors());
    }
  }

  private async afterChange(change: Promise<boolean>): Promise<void> {
    if (await change) {
      await this.load();
    } else {
      this.notifySaveFailed();
    }
  }
}
