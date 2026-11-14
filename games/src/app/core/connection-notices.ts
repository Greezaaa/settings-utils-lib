import { afterNextRender, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { SuNotificationService } from '@su-labs/notifications';
import { SiteLanguage } from '../i18n/site-language';
import { Connection } from './connection';

@Injectable({ providedIn: 'root' })
export class ConnectionNotices {
  constructor() {
    const connection = inject(Connection);
    const notifications = inject(SuNotificationService);
    const messages = inject(SiteLanguage).messages;
    const isRendered = signal(false);
    let wasOnline: boolean | null = null;
    afterNextRender(() => isRendered.set(true));
    effect(() => {
      if (!isRendered()) {
        return;
      }
      const isOnline = connection.isOnline();
      if (wasOnline !== null && isOnline !== wasOnline) {
        const { site } = untracked(messages);
        notifications.show(isOnline ? { type: 'success', message: site.backOnline } : { type: 'info', message: site.wentOffline });
      }
      wasOnline = isOnline;
    });
  }
}
