import { Injectable, signal, WritableSignal } from '@angular/core';
import { SuVisitData, SuVisitTrackerConfig } from './visit-tracker.types';

@Injectable({ providedIn: 'root' })
export class SuVisitTrackerService {
  /** Key used for localStorage */
  private storageKey = 'su:visits';

  /** Milestone visits to track */
  private milestones = [10, 100];

  /** Current visit count */
  public count: WritableSignal<number> = signal(0);

  /** Last visit date as ISO string */
  public lastVisit: WritableSignal<string | null> = signal(null);

  /** True if current visit is the first milestone (default 10th visit) */
  public isTenthVisit: WritableSignal<boolean> = signal(false);

  /** True if current visit is the second milestone (default 100th visit) */
  public isHundredthVisit: WritableSignal<boolean> = signal(false);

  /** Initialize the service and update signals */
  public init(config?: SuVisitTrackerConfig): void {
    if (config?.storageKey) this.storageKey = config.storageKey;
    if (config?.milestoneVisits) this.milestones = config.milestoneVisits;

    const stored: Partial<SuVisitData> = JSON.parse(
      localStorage.getItem(this.storageKey) ?? '{}',
    );

    const prevCount = stored.count ?? 0;
    const prevDate = stored.lastVisit ?? null;
    const newCount = prevCount + 1;

    this.count.set(newCount);
    this.lastVisit.set(prevDate);

    this.updateMilestones(newCount);

    localStorage.setItem(
      this.storageKey,
      JSON.stringify({ count: newCount, lastVisit: new Date().toISOString() }),
    );
  }

  /** Update milestone boolean signals */
  private updateMilestones(count: number) {
    this.isTenthVisit.set(count === (this.milestones[0] ?? 10));
    this.isHundredthVisit.set(count === (this.milestones[1] ?? 100));
  }
}
