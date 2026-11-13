import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { SuDialogService } from '@su-labs/dialog';
import { AdminApi, AdminSuggestion, SUGGESTION_STATUSES, SuggestionStatus } from '../../../core/admin-api';
import { SiteLanguage } from '../../../i18n/site-language';
import { TranslatePipe } from '../../../i18n/translate-pipe';
import { PagedList } from '../paged-list';
import { saveFailedNotice } from '../save-failed-notice';

@Component({
  selector: 'app-admin-suggestions',
  host: { class: 'admin-tab' },
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-suggestions.html',
  styleUrls: ['../admin.scss', './admin-suggestions.scss'],
})
export class AdminSuggestions {
  private readonly admin = inject(AdminApi);
  private readonly dialog = inject(SuDialogService);
  protected readonly t = inject(SiteLanguage).messages;

  protected readonly statuses = SUGGESTION_STATUSES;
  protected readonly status = signal<SuggestionStatus>('new');
  protected readonly list = new PagedList(offset => this.admin.suggestions(this.status(), offset));
  private readonly notifySaveFailed = saveFailedNotice();
  protected readonly images = signal<ReadonlyMap<string, string>>(new Map());

  constructor() {
    void this.list.reload();
    inject(DestroyRef).onDestroy(() => this.images().forEach(url => URL.revokeObjectURL(url)));
  }

  protected show(status: SuggestionStatus): void {
    this.status.set(status);
    void this.list.reload();
  }

  protected async showImage(id: string): Promise<void> {
    const image = await this.admin.suggestionImage(id);
    if (image) {
      this.images.update(images => new Map(images).set(id, URL.createObjectURL(image)));
    }
  }

  protected async move(suggestion: AdminSuggestion, status: SuggestionStatus): Promise<void> {
    await this.afterChange(suggestion, this.admin.setSuggestionStatus(suggestion.id, status));
  }

  protected async remove(suggestion: AdminSuggestion): Promise<void> {
    const { confirmDelete, delete: deleteLabel } = this.t().admin;
    if (await this.dialog.confirm({ title: confirmDelete, acceptLabel: deleteLabel, danger: true })) {
      await this.afterChange(suggestion, this.admin.deleteSuggestion(suggestion.id));
    }
  }

  protected otherStatuses(status: SuggestionStatus): SuggestionStatus[] {
    return SUGGESTION_STATUSES.filter(other => other !== status);
  }

  private async afterChange(suggestion: AdminSuggestion, change: Promise<boolean>): Promise<void> {
    if (await change) {
      this.list.remove(suggestion);
    } else {
      this.notifySaveFailed();
    }
  }
}
