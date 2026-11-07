import { afterNextRender, ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { SuNotificationService } from '@su-labs/notifications';
import { forgetSharedSettings } from '../../core/shared-settings';
import { deleteSaved, isSavingAllowed, setSavingAllowed } from '../../core/site-storage';
import { formatMoment, LATEST_PUBLISHED } from '../../core/site-updates';
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
  private readonly language = inject(SiteLanguage);
  protected readonly t = this.language.messages;
  private readonly notifications = inject(SuNotificationService);

  /** Read in the browser, where the choice is stored */
  protected readonly savingAllowed = signal(true);

  /** Shown in the visitor's own time zone, so only once in the browser */
  private readonly inBrowser = signal(false);
  protected readonly lastUpdate = computed(() =>
    this.inBrowser() ? formatMoment(LATEST_PUBLISHED, this.language.language()) : null,
  );

  constructor() {
    afterNextRender(() => {
      this.savingAllowed.set(isSavingAllowed());
      this.inBrowser.set(true);
    });
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
