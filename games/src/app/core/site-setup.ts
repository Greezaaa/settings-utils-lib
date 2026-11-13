import { inject } from '@angular/core';
import { FontSizeService } from '@su-labs/font-size';
import { SuNotificationService } from '@su-labs/notifications';
import { SHARED_SETTINGS } from './shared-settings';
import { SiteTheme } from './site-theme';

export function setUpSite(): void {
  inject(SiteTheme).init();

  const fontSize = inject(FontSizeService);
  fontSize.configure({
    defaultSize: 16,
    minSize: 12,
    maxSize: 22,
    step: 2,
    storage: SHARED_SETTINGS.storage,
    storageKey: SHARED_SETTINGS.fontSizeKey,
  });
  fontSize.init();

  inject(SuNotificationService).configure({ position: 'bottom-right' });
}
