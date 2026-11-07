import { inject } from '@angular/core';
import { FontSizeService } from '@su-labs/font-size';
import { SuNotificationService } from '@su-labs/notifications';
import { SHARED_SETTINGS } from './shared-settings';
import { SiteTheme } from './site-theme';

/**
 * Start the site's utilities once, before the first render.
 * The games run on the su-labs libraries too: theme, font size and notifications.
 */
export function setUpSite(): void {
  inject(SiteTheme).init();

  const fontSize = inject(FontSizeService);
  // Shared with the other su-labs site; key and limits are also read by the inline script in index.html
  fontSize.configure({
    defaultSize: 16,
    minSize: 12,
    maxSize: 22,
    step: 2,
    storage: SHARED_SETTINGS.storage,
    storageKey: SHARED_SETTINGS.fontSizeKey,
  });
  fontSize.init();

  // Bottom right, clear of the header's settings and the game boards
  inject(SuNotificationService).configure({ position: 'bottom-right' });
}
