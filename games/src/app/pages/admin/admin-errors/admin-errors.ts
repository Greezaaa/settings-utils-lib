import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { SuDialogService } from '@su-labs/dialog';
import { AdminApi, LoggedError } from '../../../core/admin-api';
import { formatMoment } from '../../../core/site-updates';
import { SiteLanguage } from '../../../i18n/site-language';
import { saveFailedNotice } from '../save-failed-notice';
import { TranslatePipe } from '../../../i18n/translate-pipe';

@Component({
  selector: 'app-admin-errors',
  host: { class: 'admin-tab' },
  imports: [TranslatePipe],
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
