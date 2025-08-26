import { Injectable, signal, WritableSignal } from '@angular/core';
import { SuVisitData, SuVisitTrackerConfig } from './visit-tracker.types';

@Injectable({ providedIn: 'root' })
export class SuVisitTrackerService {
  /** Key used for localStorage */
  private storageKey = 'su:visits';

  /** Milestones to track */
  private _milestones: number[] = [10, 100];

  /** Current visit count */
  public count: WritableSignal<number> = signal(0);

  /** Last visit date as ISO string */
  public lastVisit: WritableSignal<string | null> = signal(null);

  /** The number of the milestone reached on the current visit, or null */
  public milestone: WritableSignal<number | null> = signal(null);

  /** Initialize the service and update signals */
  public init(config?: SuVisitTrackerConfig): void {
    if (config?.storageKey) {
      this.storageKey = config.storageKey;
    }
    if (config?.milestoneVisits && Array.isArray(config.milestoneVisits)) {
      this._milestones = config.milestoneVisits.sort((a, b) => a - b);
    }

    const storedData = localStorage.getItem(this.storageKey);
    const stored: Partial<SuVisitData> = storedData ? JSON.parse(storedData) : {};

    const prevCount = stored.count ?? 0;
    const prevDate = stored.lastVisit ?? null;
    const newCount = prevCount + 1;

    this.count.set(newCount);
    this.lastVisit.set(prevDate);

    this.updateMilestone(newCount);

    localStorage.setItem(
      this.storageKey,
      JSON.stringify({ count: newCount, lastVisit: new Date().toISOString() }),
    );
  }

  /** Update the milestone signal based on the current count */
  private updateMilestone(count: number): void {
    const reachedMilestone = this._milestones.find(m => m === count);
    this.milestone.set(reachedMilestone ?? null);
  }
}
