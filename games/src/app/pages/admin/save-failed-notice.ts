import { inject } from '@angular/core';
import { SuNotificationService } from '@su-labs/notifications';
import { SiteLanguage } from '../../i18n/site-language';

/**
 * Shows "The change wasn't saved" as an error notification, the same in every admin tab; call it in a component's
 * field initializer, then call the function it returns when a save fails
 */
export function saveFailedNotice(): () => void {
  const notifications = inject(SuNotificationService);
  const t = inject(SiteLanguage).messages;
  return () => notifications.show({ type: 'error', message: t().admin.saveFailed });
}
