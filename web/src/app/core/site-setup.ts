import { inject } from '@angular/core';
import { FontSizeService } from '@su-labs/font-size';
import { SuNotificationService } from '@su-labs/notifications';
import { SuVisitTrackerService } from '@su-labs/visit-tracker';
import { SHARED_SETTINGS } from './shared-settings';
import { isSavingAllowed } from './site-storage';
import { SiteTheme } from './site-theme';

export const VISIT_STORAGE_KEY = 'su-labs-site:visits';

export const VISIT_MILESTONES = [3, 10, 50, 100];

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

  const notifications = inject(SuNotificationService);
  notifications.configure({ position: 'bottom-right' });

  const visits = inject(SuVisitTrackerService);
  if (!isSavingAllowed()) {
    return;
  }
  visits.init({ storageKey: VISIT_STORAGE_KEY, milestoneVisits: VISIT_MILESTONES });

  const milestone = visits.milestone();
  if (milestone) {
    notifications.show({ type: 'success', message: `This is your visit number ${milestone}. Thanks for coming back.` });
  }
}
