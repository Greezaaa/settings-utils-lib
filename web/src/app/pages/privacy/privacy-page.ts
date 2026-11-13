import { afterNextRender, ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { SuNotificationService } from '@su-labs/notifications';
import { forgetSharedSettings } from '../../core/shared-settings';
import { deleteSaved, isSavingAllowed, setSavingAllowed } from '../../core/site-storage';

/** One thing the site saves, where and why */
interface SavedItem {
  readonly what: string;
  readonly where: string;
  readonly why: string;
}

const SAVED: readonly SavedItem[] = [
  {
    what: 'Theme and text size',
    where: 'A cookie for su-labs.dev',
    why: 'So su-labs.dev and games.su-labs.dev look the way you chose',
  },
  {
    what: 'Your visits',
    where: 'This browser’s local storage',
    why: 'For the visit tracker demo and its “thanks for coming back” messages: how many times and when you last came',
  },
  { what: 'Notices you’ve seen', where: 'Local storage', why: 'So we don’t show them again' },
  { what: 'Menu sections you opened', where: 'Local storage', why: 'So the menu looks the way you left it' },
  {
    what: 'Your choice about saving (only when you turn it off)',
    where: 'A cookie for su-labs.dev',
    why: 'So neither su-labs site saves anything, as you asked',
  },
];

const NEVER: readonly string[] = [
  'No accounts and no personal data',
  'No ads, no analytics and no tracking',
  'Nothing is sold or shared with anyone',
];

/**
 * Privacy: what su-labs.dev saves, where and why, and a switch to stop saving anything. The switch is shared with
 * games.su-labs.dev, as both sites share the theme and text size. Turning it off deletes what was saved.
 */
@Component({
  selector: 'app-privacy-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './privacy-page.html',
  styleUrls: ['../../shared/utility-page.scss', './privacy-page.scss'],
})
export class PrivacyPage {
  private readonly notifications = inject(SuNotificationService);
  protected readonly saved = SAVED;
  protected readonly never = NEVER;

  /** Read in the browser, where the choice is stored */
  protected readonly savingAllowed = signal(true);

  constructor() {
    afterNextRender(() => this.savingAllowed.set(isSavingAllowed()));
  }

  /** Wipes everything saved so far; saving goes on if the visitor allows it, from a fresh start */
  protected deleteSaved(): void {
    deleteSaved(forgetSharedSettings);
    this.notifications.show({
      type: 'success',
      message: 'Done: everything su-labs.dev saved on this device is deleted.',
    });
  }

  protected onChange(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      setSavingAllowed(event.target.checked, forgetSharedSettings);
      this.savingAllowed.set(event.target.checked);
    }
  }
}
