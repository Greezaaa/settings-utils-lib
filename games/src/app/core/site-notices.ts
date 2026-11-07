import { afterNextRender, computed, effect, inject, Injectable, Injector, Signal } from '@angular/core';
import { SuNotificationService } from '@su-labs/notifications';
import { SiteLanguage } from '../i18n/site-language';
import { readStored, writeStored } from './site-storage';
import { changesIn, LATEST_PRIVACY_VERSION, LATEST_VERSION, updatesSince } from './site-updates';

/** The site version the visitor last saw */
const LAST_SEEN_STORAGE = 'last-seen-version';
/** The version whose privacy notice the visitor closed */
const PRIVACY_SEEN_STORAGE = 'privacy-notice-version';
/** Before versions, closing the privacy notice was saved as `true`: that visitor has seen version 1 */
const OLD_PRIVACY_STORAGE = 'privacy-notice-dismissed';

const readVersion = (name: string): number | null => {
  const value = readStored(name);
  return typeof value === 'number' && Number.isInteger(value) ? value : null;
};

/**
 * The two notices shown when a visitor arrives, with @su-labs/notifications, each until it is closed:
 * - the privacy notice, on a first visit and again whenever an update changes what the site stores;
 * - "New since your last visit", listing the big changes (site-updates.ts) made since the version they saw.
 * Closing a notice is what marks it as seen. Both follow the site language while they are open.
 */
@Injectable({ providedIn: 'root' })
export class SiteNotices {
  private readonly notifications = inject(SuNotificationService);
  private readonly language = inject(SiteLanguage);
  private readonly injector = inject(Injector);

  constructor() {
    // After the first render, once the saved language has been applied
    afterNextRender(() => this.showDue());
  }

  private showDue(): void {
    const oldDismissed = readStored(OLD_PRIVACY_STORAGE) === true;
    const privacySeen = readVersion(PRIVACY_SEEN_STORAGE) ?? (oldDismissed ? 1 : 0);
    const lastSeen = readVersion(LAST_SEEN_STORAGE) ?? (oldDismissed ? 1 : null);

    if (privacySeen < LATEST_PRIVACY_VERSION) {
      this.open(
        computed(() => this.language.messages().site.privacyNotice),
        () => writeStored(PRIVACY_SEEN_STORAGE, LATEST_VERSION),
      );
    }

    if (lastSeen === null) {
      // A first visit: everything is new, so there is nothing to list
      writeStored(LAST_SEEN_STORAGE, LATEST_VERSION);
      return;
    }
    const updates = updatesSince(lastSeen);
    if (updates.length > 0) {
      this.open(
        computed(() => {
          const changes = changesIn(updates, this.language.language());
          return [this.language.messages().site.whatsNew, ...changes.map((change) => `• ${change}`)].join('\n');
        }),
        () => writeStored(LAST_SEEN_STORAGE, LATEST_VERSION),
        'whats-new',
      );
    }
  }

  /** Shows a notice until it is closed, then calls `onClosed`; shows it again if its text changes meanwhile */
  private open(message: Signal<string>, onClosed: () => void, cssClass?: string): void {
    const show = (): string =>
      this.notifications.show({ type: 'info', message: message(), autoClose: false, cssClass });
    let id = show();
    const watcher = effect(
      () => {
        const open = this.notifications.notifications().find((notification) => notification.id === id);
        if (!open) {
          onClosed();
          watcher.destroy();
        } else if (open.message !== message()) {
          // The language changed: replace it with the same notice in the new language
          this.notifications.dismiss(id);
          id = show();
        }
      },
      { injector: this.injector },
    );
  }
}
