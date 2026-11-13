import { afterNextRender, computed, effect, inject, Injectable, Injector, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { SuNotificationAction, SuNotificationService } from '@su-labs/notifications';
import { SiteLanguage } from '../i18n/site-language';
import { WORD_GENDERS } from '../i18n/word-gender';
import { FeatureFlags } from './feature-flags';
import { PlayerGender } from './player-gender';
import { readStored, writeStored } from './site-storage';
import { LATEST_PRIVACY_VERSION, LATEST_VERSION } from './site-updates';

/** The version whose privacy notice the visitor closed */
const PRIVACY_SEEN_STORAGE = 'privacy-notice-version';
/** Before versions, closing the privacy notice was saved as `true`: that visitor has seen version 1 */
const OLD_PRIVACY_STORAGE = 'privacy-notice-dismissed';
const GENDER_ASKED_STORAGE = 'word-gender-asked';

interface NoticeContent {
  readonly message: string;
  readonly actions: SuNotificationAction[];
}

const readVersion = (name: string): number | null => {
  const value = readStored(name);
  return typeof value === 'number' && Number.isInteger(value) ? value : null;
};

const signature = ({ message, actions }: NoticeContent): string =>
  [message, ...actions.map(({ label }) => label)].join('\n');

/**
 * The site's notices, with @su-labs/notifications, one at a time, each following the site language while it is open:
 * - privacy: on a first visit and again whenever an update changes what the site saves, with "OK" and a button to the
 *   privacy page, until it is closed
 * - then, while the `word-gender` switch is on, a single question: be spoken to as a boy or a girl. Closing it without
 *   choosing counts as asked; the choice can always change in the header settings.
 * (What's new is listed on the home page instead, where it never covers the screen.)
 */
@Injectable({ providedIn: 'root' })
export class SiteNotices {
  private readonly notifications = inject(SuNotificationService);
  private readonly language = inject(SiteLanguage);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly features = inject(FeatureFlags);
  private readonly gender = inject(PlayerGender);

  constructor() {
    afterNextRender(() => this.showDue());
  }

  private showDue(): void {
    const oldDismissed = readStored(OLD_PRIVACY_STORAGE) === true;
    const privacySeen = readVersion(PRIVACY_SEEN_STORAGE) ?? (oldDismissed ? 1 : 0);
    if (privacySeen >= LATEST_PRIVACY_VERSION) {
      void this.askGender();
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
      () => {
        writeStored(PRIVACY_SEEN_STORAGE, LATEST_VERSION);
        void this.askGender();
      },
    );
  }

  private async askGender(): Promise<void> {
    await this.features.ready();
    if (!this.gender.isAvailable() || this.gender.choice() !== null || readStored(GENDER_ASKED_STORAGE) === true) {
      return;
    }
    this.open(
      computed(() => {
        const { site } = this.language.messages();
        return {
          message: site.wordGenderQuestion,
          actions: WORD_GENDERS.map((gender) => ({
            label: site.wordGenderAnswers[gender],
            onClick: () => this.gender.set(gender),
          })),
        };
      }),
      () => writeStored(GENDER_ASKED_STORAGE, true),
    );
  }

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
          this.notifications.dismiss(id);
          id = show();
          shown = current;
        }
      },
      { injector: this.injector },
    );
  }
}
