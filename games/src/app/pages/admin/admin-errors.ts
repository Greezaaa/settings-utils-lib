import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { SuDialogService } from '@su-labs/dialog';
import { AdminApi, LoggedError } from '../../core/admin-api';
import { formatMoment } from '../../core/site-updates';
import { SiteLanguage } from '../../i18n/site-language';
import { saveFailedNotice } from './save-failed-notice';

/**
 * Admin tab, for the super admin: errors from the API and from visitors' browsers, latest first, each with its code,
 * title, problem, page, how many times and when it happened. Remove an error once it's fixed, or clear them all.
 */
@Component({
  selector: 'app-admin-errors',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-errors.html',
  styleUrl: './admin.scss',
})
export class AdminErrors {
  private readonly admin = inject(AdminApi);
  private readonly dialog = inject(SuDialogService);
  private readonly language = inject(SiteLanguage);
  /** Texts in the site's language */
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

  /** A moment in the visitor's language and time zone */
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
