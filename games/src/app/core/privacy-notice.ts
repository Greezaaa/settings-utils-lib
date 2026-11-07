import { afterNextRender, effect, inject, Injectable, signal } from '@angular/core';
import { SuNotificationService } from '@su-labs/notifications';
import { SiteLanguage } from '../i18n/site-language';
import { readStored, writeStored } from './site-storage';

const DISMISSED_STORAGE = 'privacy-notice-dismissed';

/**
 * A short note on what the site stores (preferences only, never sold or shared), shown once with
 * @su-labs/notifications until the visitor closes it; closing it is remembered in this browser.
 * It follows the site language, also while it is open.
 */
@Injectable({ providedIn: 'root' })
export class PrivacyNotice {
  private readonly notifications = inject(SuNotificationService);
  private readonly language = inject(SiteLanguage);
  /** Id of the open notice, if any */
  private readonly openId = signal<string | null>(null);

  constructor() {
    // After the first render, once the saved language has been applied
    afterNextRender(() => {
      if (readStored(DISMISSED_STORAGE) !== true) {
        this.show();
      }
    });

    // Closed by the visitor: remember it
    effect(() => {
      const id = this.openId();
      if (id !== null && !this.notifications.notifications().some((notification) => notification.id === id)) {
        this.openId.set(null);
        writeStored(DISMISSED_STORAGE, true);
      }
    });

    // Language changed while it is open: show it again in the new language
    effect(() => {
      const message = this.language.messages().site.privacyNotice;
      const id = this.openId();
      if (
        id !== null &&
        this.notifications.notifications().find((notification) => notification.id === id)?.message !== message
      ) {
        this.notifications.dismiss(id);
        this.openId.set(this.notifications.show({ type: 'info', message, autoClose: false }));
      }
    });
  }

  private show(): void {
    const message = this.language.messages().site.privacyNotice;
    this.openId.set(this.notifications.show({ type: 'info', message, autoClose: false }));
  }
}
