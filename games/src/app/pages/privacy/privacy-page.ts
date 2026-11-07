import { afterNextRender, ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { SuNotificationService } from '@su-labs/notifications';
import { forgetSharedSettings } from '../../core/shared-settings';
import { deleteSaved, isSavingAllowed, setSavingAllowed } from '../../core/site-storage';
import { SiteLanguage } from '../../i18n/site-language';

/**
 * Privacy: what the games site saves, where and why, and a switch to stop saving anything.
 * Turning it off deletes what was saved, in local storage and in the shared cookies.
 */
@Component({
  selector: 'app-privacy-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './privacy-page.html',
  styleUrls: ['../../shared/utility-page.scss', './privacy-page.scss'],
})
export class PrivacyPage {
  /** Texts in the site's language */
  protected readonly t = inject(SiteLanguage).messages;
  private readonly notifications = inject(SuNotificationService);

  /** Read in the browser, where the choice is stored */
  protected readonly savingAllowed = signal(true);

  constructor() {
    afterNextRender(() => this.savingAllowed.set(isSavingAllowed()));
  }

  /** Wipes everything saved so far; saving goes on if the visitor allows it, from a fresh start */
  protected deleteSaved(): void {
    deleteSaved(forgetSharedSettings);
    this.notifications.show({ type: 'success', message: this.t().privacy.deleted });
  }

  protected onChange(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      setSavingAllowed(event.target.checked, forgetSharedSettings);
      this.savingAllowed.set(event.target.checked);
    }
  }
}
