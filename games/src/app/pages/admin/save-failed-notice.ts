import { inject } from '@angular/core';
import { SuNotificationService } from '@su-labs/notifications';
import { SiteLanguage } from '../../i18n/site-language';

export function saveFailedNotice(): () => void {
  const notifications = inject(SuNotificationService);
  const t = inject(SiteLanguage).messages;
  return () => notifications.show({ type: 'error', message: t().admin.saveFailed });
}
