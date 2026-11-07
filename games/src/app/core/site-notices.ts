import { afterNextRender, computed, effect, inject, Injectable, Injector, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { SuNotificationAction, SuNotificationService } from '@su-labs/notifications';
import { SiteLanguage } from '../i18n/site-language';
import { readStored, writeStored } from './site-storage';
import { LATEST_PRIVACY_VERSION, LATEST_VERSION } from './site-updates';

/** The version whose privacy notice the visitor closed */
const PRIVACY_SEEN_STORAGE = 'privacy-notice-version';
/** Before versions, closing the privacy notice was saved as `true`: that visitor has seen version 1 */
const OLD_PRIVACY_STORAGE = 'privacy-notice-dismissed';

/** What a notice shows; it is rebuilt when the language changes */
interface NoticeContent {
  readonly message: string;
  readonly actions: SuNotificationAction[];
}

const readVersion = (name: string): number | null => {
  const value = readStored(name);
  return typeof value === 'number' && Number.isInteger(value) ? value : null;
};

/** Notices are compared by their text and button labels to tell when the language changed */
const signature = ({ message, actions }: NoticeContent): string =>
  [message, ...actions.map(({ label }) => label)].join('\n');

/**
 * The privacy notice, with @su-labs/notifications: shown on a first visit and again whenever an update changes what
 * the site saves, with "OK" and a button to the privacy page, until it is closed. It follows the site language while
 * it is open. (What's new is listed on the home page instead, where it never covers the screen.)
 */
@Injectable({ providedIn: 'root' })
export class SiteNotices {
  private readonly notifications = inject(SuNotificationService);
  private readonly language = inject(SiteLanguage);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);

  constructor() {
    // After the first render, once the saved language has been applied
    afterNextRender(() => this.showDue());
  }

  private showDue(): void {
    const oldDismissed = readStored(OLD_PRIVACY_STORAGE) === true;
    const privacySeen = readVersion(PRIVACY_SEEN_STORAGE) ?? (oldDismissed ? 1 : 0);
    if (privacySeen >= LATEST_PRIVACY_VERSION) {
      return;
    }
    this.open(
      computed(() => {
        const { site } = this.language.messages();
        return {
          message: site.privacyNotice,
          actions: [
            { label: site.noticeOk, onClick: () => undefined },
            { label: site.privacySettings, onClick: () => void this.router.navigateByUrl('/privacy') },
          ],
        };
      }),
      () => writeStored(PRIVACY_SEEN_STORAGE, LATEST_VERSION),
    );
  }

  /** Shows a notice until it is closed, then calls `onClosed`; shows it again if its content changes meanwhile */
  private open(content: Signal<NoticeContent>, onClosed: () => void): void {
    const show = (): string => this.notifications.show({ type: 'info', autoClose: false, ...content() });
    let id = show();
    let shown = signature(content());
    const watcher = effect(
      () => {
        const isOpen = this.notifications.notifications().some((notification) => notification.id === id);
        const current = signature(content());
        if (!isOpen) {
          onClosed();
          watcher.destroy();
        } else if (current !== shown) {
          // The language changed: replace it with the same notice in the new language
          this.notifications.dismiss(id);
          id = show();
          shown = current;
        }
      },
      { injector: this.injector },
    );
  }
}
