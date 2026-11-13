import { DatePipe } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SuNotificationService } from '@su-labs/notifications';
import { SuVisitTrackerService } from '@su-labs/visit-tracker';
import { getUtility } from '../../core/packages';
import { VISIT_MILESTONES, VISIT_STORAGE_KEY } from '../../core/site-setup';
import { isSavingAllowed } from '../../core/site-storage';
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
  imports: [DatePipe, RouterLink, UtilityPage],
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
  protected readonly savingAllowed = signal(true);

  constructor() {
    afterNextRender(() => this.savingAllowed.set(isSavingAllowed()));
  }

  protected forget(): void {
    localStorage.removeItem(VISIT_STORAGE_KEY);
    this.notifications.show({ type: 'info', message: 'Visits forgotten. Reload the page to start again from 1.' });
  }

  protected reload(): void {
    location.reload();
  }
}
