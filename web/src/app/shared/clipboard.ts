import { inject, Injectable } from '@angular/core';
import { SuNotificationService } from '@su-labs/notifications';

@Injectable({ providedIn: 'root' })
export class Clipboard {
  private readonly notifications = inject(SuNotificationService);

  async copy(text: string, message = 'Copied to clipboard.'): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.notifications.show({ type: 'success', message, duration: 2000 });
    } catch {
      this.notifications.show({
        type: 'error',
        message: 'Copying is blocked in this browser. Select the code instead.',
      });
    }
  }
}
