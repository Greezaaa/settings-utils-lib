import { afterNextRender, ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { SuNotificationService } from '@su-labs/notifications';
import { GameAvailability } from '../../core/game-availability';
import { PlayerAccount } from '../../core/player-account';
import { forgetSharedSettings } from '../../core/shared-settings';
import { deleteSaved, isSavingAllowed, setSavingAllowed } from '../../core/site-storage';
import { formatMoment, LATEST_PUBLISHED } from '../../core/site-updates';
import { SiteLanguage } from '../../i18n/site-language';
import { TranslatePipe } from '../../i18n/translate-pipe';

/**
 * Privacy: what the games site saves, where and why, and a switch to stop saving anything.
 * Turning it off deletes what was saved, in local storage and in the shared cookies.
 */
@Component({
  selector: 'app-privacy-page',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './privacy-page.html',
  styleUrls: ['../../shared/utility-page.scss', '../../shared/switch.scss', './privacy-page.scss'],
})
export class PrivacyPage {
  private readonly language = inject(SiteLanguage);
  protected readonly t = this.language.messages;
  private readonly notifications = inject(SuNotificationService);
  private readonly account = inject(PlayerAccount);
  private readonly availability = inject(GameAvailability);
  protected readonly accountsOpen = this.account.isAvailable;
  protected readonly canEmail = signal(false);
  protected readonly isSingClosed = computed(
    () => this.availability.isKnown() && !this.availability.isOpen('hit-the-note'),
  );

  protected readonly savingAllowed = signal(true);

  private readonly inBrowser = signal(false);
  protected readonly lastUpdate = computed(() =>
    this.inBrowser() ? formatMoment(LATEST_PUBLISHED, this.language.language()) : null,
  );

  constructor() {
    afterNextRender(async () => {
      this.savingAllowed.set(isSavingAllowed());
      this.inBrowser.set(true);
      this.canEmail.set(await this.account.canEmail());
    });
  }

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
