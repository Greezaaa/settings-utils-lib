import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { SuNotificationPosition, SuNotificationService, SuNotificationType } from '@su-labs/notifications';
import { getUtility } from '../../core/packages';
import { CodeTab } from '../../shared/code-tabs';
import { UtilityPage } from '../../shared/utility-page';

/** One example message per notification type */
const EXAMPLES: readonly { type: SuNotificationType; label: string; message: string }[] = [
  { type: 'success', label: 'Success', message: 'Your settings were saved.' },
  { type: 'info', label: 'Info', message: 'Version 22.1.0 is available.' },
  { type: 'warning', label: 'Warning', message: 'Storage is almost full.' },
  { type: 'error', label: 'Error', message: 'Could not reach the server. Try again.' },
];

const POSITIONS: readonly SuNotificationPosition[] = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
];

const DURATIONS = [2000, 4000, 8000] as const;

const USAGE: readonly CodeTab[] = [
  {
    label: 'Angular',
    code: `// app.html, once
<su-lib-notifications />

// any component or service
private readonly notifications = inject(SuNotificationService);

this.notifications.show({ type: 'success', message: 'Saved!' });`,
  },
  {
    label: 'Any framework',
    code: `import { SuNotificationController } from '@su-labs/core/notifications';

const notifications = new SuNotificationController();
notifications.configure({ position: 'top-right' });

// render the list with your own markup
notifications.notifications.subscribe((list) => render(list));
notifications.show({ type: 'success', message: 'Saved!' });`,
  },
];

@Component({
  selector: 'app-notifications-page',
  imports: [UtilityPage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notifications-page.html',
})
export class NotificationsPage {
  protected readonly utility = getUtility('notifications');
  protected readonly usage = USAGE;
  protected readonly examples = EXAMPLES;
  protected readonly positions = POSITIONS;
  protected readonly durations = DURATIONS;

  protected readonly notifications = inject(SuNotificationService);
  protected readonly position = signal<SuNotificationPosition>(this.notifications.position);
  protected readonly duration = signal<number>(4000);
  protected readonly autoClose = signal(true);

  protected show(type: SuNotificationType, message: string): void {
    this.notifications.show({ type, message, duration: this.duration(), autoClose: this.autoClose() });
  }

  protected setPosition(event: Event): void {
    if (event.target instanceof HTMLSelectElement) {
      const { value } = event.target;
      const position = POSITIONS.find((item) => item === value);
      if (position) {
        this.notifications.position = position;
        this.position.set(position);
      }
    }
  }

  protected setDuration(event: Event): void {
    if (event.target instanceof HTMLSelectElement) {
      this.duration.set(Number(event.target.value));
    }
  }

  protected setAutoClose(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.autoClose.set(event.target.checked);
    }
  }
}
