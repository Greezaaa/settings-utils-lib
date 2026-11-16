import { afterNextRender, ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { SuSwitchComponent } from '@su-labs/fields';
import { SuNotificationService } from '@su-labs/notifications';
import { SuTableColumns, SuTableComponent } from '@su-labs/table';
import { forgetSharedSettings } from '../../core/shared-settings';
import { deleteSaved, isSavingAllowed, setSavingAllowed } from '../../core/site-storage';

interface SavedItem {
  readonly what: string;
  readonly where: string;
  readonly why: string;
}

const SAVED: readonly SavedItem[] = [
  {
    what: 'Theme, text size and motion',
    where: 'A cookie for su-labs.dev',
    why: 'So su-labs.dev looks the way you chose',
  },
  {
    what: 'Your visits',
    where: 'This browser’s local storage',
    why: 'For the visit tracker demo and its “thanks for coming back” messages: how many times and when you last came',
  },
  { what: 'Notices you’ve seen', where: 'Local storage', why: 'So we don’t show them again' },
  {
    what: 'The menu: sections you opened, its order, and whether it’s open or closed',
    where: 'Local storage',
    why: 'So the menu looks the way you left it',
  },
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

const SAVED_COLUMNS: SuTableColumns<SavedItem> = [
  { key: 'what', header: 'What' },
  { key: 'where', header: 'Where' },
  { key: 'why', header: 'Why' },
];

/**
 * Privacy: what su-labs.dev saves, where and why, and a switch to stop saving anything. Turning it off deletes what was
 * saved.
 */
@Component({
  selector: 'app-privacy-page',
  imports: [SuSwitchComponent, SuTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './privacy-page.html',
  styleUrls: ['../../shared/utility-page.scss', './privacy-page.scss'],
})
export class PrivacyPage {
  private readonly notifications = inject(SuNotificationService);
  protected readonly saved = SAVED;
  protected readonly savedColumns = SAVED_COLUMNS;
  protected readonly savedId = (item: SavedItem): string => item.what;
  protected readonly never = NEVER;

  protected readonly savingAllowed = signal(true);

  constructor() {
    afterNextRender(() => this.savingAllowed.set(isSavingAllowed()));
  }

  protected deleteSaved(): void {
    deleteSaved(forgetSharedSettings);
    this.notifications.show({
      type: 'success',
      message: 'Done: everything su-labs.dev saved on this device is deleted.',
    });
  }

  protected onChange(allowed: boolean): void {
    setSavingAllowed(allowed, forgetSharedSettings);
    this.savingAllowed.set(allowed);
  }
}
