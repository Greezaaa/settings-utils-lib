import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SuNotificationService } from '@su-labs/notifications';
import { SuVisitTrackerService } from '@su-labs/visit-tracker';
import { getUtility } from '../../core/packages';
import { VISIT_MILESTONES, VISIT_STORAGE_KEY } from '../../core/site-setup';
import { CodeTab } from '../../shared/code-tabs';
import { UtilityPage } from '../../shared/utility-page';

const USAGE: readonly CodeTab[] = [
  {
    label: 'Angular',
    code: `// app.config.ts
provideAppInitializer(() => inject(SuVisitTrackerService).init({ milestoneVisits: [10, 100] }));

// template
@if (visits.milestone(); as milestone) {
  <p>Visit number {{ milestone }}. Thanks for coming back!</p>
}`,
  },
  {
    label: 'Any framework',
    code: `import { SuVisitTrackerController } from '@su-labs/core/visit-tracker';

const visits = new SuVisitTrackerController();
visits.init({ milestoneVisits: [10, 100] }); // once per page load

const { count, lastVisit, milestone } = visits.visit.get();`,
  },
];

@Component({
  selector: 'app-visit-tracker-page',
  imports: [DatePipe, UtilityPage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './visit-tracker-page.html',
})
export class VisitTrackerPage {
  protected readonly utility = getUtility('visit-tracker');
  protected readonly usage = USAGE;
  protected readonly milestones = VISIT_MILESTONES.join(', ');
  protected readonly storageKey = VISIT_STORAGE_KEY;
  protected readonly visits = inject(SuVisitTrackerService);

  private readonly notifications = inject(SuNotificationService);

  /** Remove the saved visits so the next page load counts as the first visit */
  protected forget(): void {
    localStorage.removeItem(VISIT_STORAGE_KEY);
    this.notifications.show({ type: 'info', message: 'Visits forgotten. Reload the page to start again from 1.' });
  }

  protected reload(): void {
    location.reload();
  }
}
