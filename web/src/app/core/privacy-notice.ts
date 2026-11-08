import { afterNextRender, effect, inject, Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { SuNotificationService } from '@su-labs/notifications';
import { readStored, writeStored } from './site-storage';

/**
 * Raise when what the site saves changes, so visitors see the notice again (and update the privacy page).
 * 1: theme and text size cookies, visit count, notices seen.
 */
export const PRIVACY_VERSION = 1;
const PRIVACY_SEEN_STORAGE = 'privacy-notice-version';

/**
 * The privacy notice: on a first visit, and again when PRIVACY_VERSION goes up, with "OK" and a button to the privacy
 * page, until it is closed (by either button or ×), which marks it as seen.
 */
@Injectable({ providedIn: 'root' })
export class PrivacyNotice {
  private readonly notifications = inject(SuNotificationService);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);

  constructor() {
    afterNextRender(() => this.showIfDue());
  }

  private showIfDue(): void {
    const seen = readStored(PRIVACY_SEEN_STORAGE);
    if (typeof seen === 'number' && seen >= PRIVACY_VERSION) {
      return;
    }
    const id = this.notifications.show({
      type: 'info',
      autoClose: false,
      message:
        'We use cookies only to save your preferences, like theme and text size. We never sell or share your data with anyone.',
      actions: [
        { label: 'OK', onClick: () => undefined },
        { label: 'Privacy settings', onClick: () => void this.router.navigateByUrl('/privacy') },
      ],
    });
    const watcher = effect(
      () => {
        if (!this.notifications.notifications().some((notification) => notification.id === id)) {
          writeStored(PRIVACY_SEEN_STORAGE, PRIVACY_VERSION);
          watcher.destroy();
        }
      },
      { injector: this.injector },
    );
  }
}
