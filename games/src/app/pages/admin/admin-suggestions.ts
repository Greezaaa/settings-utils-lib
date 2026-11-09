import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { SuDialogService } from '@su-labs/dialog';
import { AdminApi, AdminSuggestion, SUGGESTION_STATUSES, SuggestionStatus } from '../../core/admin-api';
import { SiteLanguage } from '../../i18n/site-language';

/**
 * Admin tab: the suggestions players sent, by status (new, read, archived), with their pictures on request; each can
 * be moved to another status or deleted for good.
 */
import { saveFailedNotice } from './save-failed-notice';

@Component({
  selector: 'app-admin-suggestions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-suggestions.html',
  styleUrls: ['./admin.scss', './admin-suggestions.scss'],
})
export class AdminSuggestions {
  private readonly admin = inject(AdminApi);
  private readonly dialog = inject(SuDialogService);
  /** Category names in the site's language */
  protected readonly t = inject(SiteLanguage).messages;

  protected readonly statuses = SUGGESTION_STATUSES;
  protected readonly status = signal<SuggestionStatus>('new');
  protected readonly suggestions = signal<readonly AdminSuggestion[]>([]);
  protected readonly loading = signal(true);
  private readonly notifySaveFailed = saveFailedNotice();
  /** Pictures loaded so far, by suggestion, as object URLs released when the tab closes */
  protected readonly images = signal<ReadonlyMap<string, string>>(new Map());

  constructor() {
    void this.load();
    inject(DestroyRef).onDestroy(() => this.images().forEach((url) => URL.revokeObjectURL(url)));
  }

  protected show(status: SuggestionStatus): void {
    this.status.set(status);
    void this.load();
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.suggestions.set(await this.admin.suggestions(this.status()));
    this.loading.set(false);
  }

  protected async showImage(id: string): Promise<void> {
    const image = await this.admin.suggestionImage(id);
    if (image) {
      this.images.update((images) => new Map(images).set(id, URL.createObjectURL(image)));
    }
  }

  protected async move(suggestion: AdminSuggestion, status: SuggestionStatus): Promise<void> {
    await this.afterChange(this.admin.setSuggestionStatus(suggestion.id, status));
  }

  protected async remove(suggestion: AdminSuggestion): Promise<void> {
    const { confirmDelete, delete: deleteLabel } = this.t().admin;
    if (await this.dialog.confirm({ title: confirmDelete, acceptLabel: deleteLabel, danger: true })) {
      await this.afterChange(this.admin.deleteSuggestion(suggestion.id));
    }
  }

  protected otherStatuses(status: SuggestionStatus): SuggestionStatus[] {
    return SUGGESTION_STATUSES.filter((other) => other !== status);
  }

  private async afterChange(change: Promise<boolean>): Promise<void> {
    const saved = await change;
    if (saved) {
      await this.load();
    } else {
      this.notifySaveFailed();
    }
  }
}
