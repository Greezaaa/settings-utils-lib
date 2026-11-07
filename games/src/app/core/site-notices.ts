import { afterNextRender, computed, effect, inject, Injectable, Injector, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { SuNotificationAction, SuNotificationMessagePart, SuNotificationService } from '@su-labs/notifications';
import { SiteLanguage } from '../i18n/site-language';
import { readStored, writeStored } from './site-storage';
import { changesIn, formatMoment, latestChanges, LATEST_PRIVACY_VERSION, LATEST_PUBLISHED, LATEST_VERSION, updatesSince } from './site-updates';

/** The site version the visitor last saw */
const LAST_SEEN_STORAGE = 'last-seen-version';
/** The version whose privacy notice the visitor closed */
const PRIVACY_SEEN_STORAGE = 'privacy-notice-version';
/** How many of the latest changes a first-time visitor sees */
const FIRST_VISIT_CHANGES = 10;
/** Before versions, closing the privacy notice was saved as `true`: that visitor has seen version 1 */
const OLD_PRIVACY_STORAGE = 'privacy-notice-dismissed';

/** What a notice shows; it is rebuilt when the language changes */
interface NoticeContent {
  readonly message: string | readonly SuNotificationMessagePart[];
  readonly actions: SuNotificationAction[];
}

const textOf = (part: SuNotificationMessagePart): string => (typeof part === 'string' ? part : part.label);

const readVersion = (name: string): number | null => {
  const value = readStored(name);
  return typeof value === 'number' && Number.isInteger(value) ? value : null;
};

/** Notices are compared by their text and button labels to tell when the language changed */
const signature = ({ message, actions }: NoticeContent): string =>
  [typeof message === 'string' ? message : message.map(textOf).join(''), ...actions.map(({ label }) => label)].join(
    '\n',
  );

/**
 * The two notices shown when a visitor arrives, with @su-labs/notifications, each until it is closed:
 * - the privacy notice, on a first visit and again whenever an update changes what the site saves, with
 *   "OK" and a button to the privacy page;
 * - "New since your last visit", listing the big changes (site-updates.ts) since the version they saw (on a
 *   first visit, "Latest updates" with the last few changes), when
 *   the site was updated, where each change about a game is a link to it.
 * Closing a notice is what marks it as seen. Both follow the site language while they are open.
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
    const lastSeen = readVersion(LAST_SEEN_STORAGE) ?? (oldDismissed ? 1 : null);

    if (privacySeen < LATEST_PRIVACY_VERSION) {
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

    // A first visit lists the latest changes, to show the site is alive; a return visit, what is new since then
    const isFirstVisit = lastSeen === null;
    const changes = isFirstVisit ? latestChanges(FIRST_VISIT_CHANGES) : changesIn(updatesSince(lastSeen));
    if (changes.length > 0) {
      this.open(
        computed(() => {
          const language = this.language.language();
          const { site } = this.language.messages();
          const updated = site.updatedAt(formatMoment(LATEST_PUBLISHED, language));
          const lines = changes.flatMap(({ text, game }): SuNotificationMessagePart[] => [
            '\n• ',
            game
              ? { label: text[language], onClick: () => void this.router.navigateByUrl(`/${game}`) }
              : text[language],
          ]);
          return {
            // The update time comes first: it is drawn small and muted (see .whats-new in styles.scss)
            message: [`${updated}\n${isFirstVisit ? site.latestChanges : site.whatsNew}`, ...lines],
            actions: [],
          };
        }),
        () => writeStored(LAST_SEEN_STORAGE, LATEST_VERSION),
        'whats-new',
      );
    }
  }

  /** Shows a notice until it is closed, then calls `onClosed`; shows it again if its content changes meanwhile */
  private open(content: Signal<NoticeContent>, onClosed: () => void, cssClass?: string): void {
    const show = (): string => this.notifications.show({ type: 'info', autoClose: false, cssClass, ...content() });
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
