import { Injectable, OnDestroy, signal, WritableSignal } from '@angular/core';
import { SuVisitTrackerConfig, SuVisitTrackerController } from '@su-labs/core/visit-tracker';

/**
 * Angular service for tracking user visits.
 *
 * Thin wrapper around the framework-agnostic `SuVisitTrackerController` from
 * `@su-labs/core/visit-tracker` that exposes the visit data as Angular signals.
 */
@Injectable({ providedIn: 'root' })
export class SuVisitTrackerService implements OnDestroy {
  /** Framework-agnostic visit tracking logic */
  private readonly controller = new SuVisitTrackerController();

  /** Current visit count (0 until {@link init} runs) */
  public count: WritableSignal<number> = signal(0);

  /** Start of the previous visit as an ISO string, or null on the first visit */
  public lastVisit: WritableSignal<string | null> = signal(null);

  /** The number of the milestone reached on the current visit, or null */
  public milestone: WritableSignal<number | null> = signal(null);

  /** Stops syncing the controller's state into the signals */
  private readonly unsubscribe = this.controller.visit.subscribe((visit) => {
    this.count.set(visit.count);
    this.lastVisit.set(visit.lastVisit);
    this.milestone.set(visit.milestone);
  });

  /**
   * Record the current visit and update the signals.
   * Call once at application startup.
   * @param config Optional storage key and milestones.
   */
  public init(config?: SuVisitTrackerConfig): void {
    this.controller.init(config);
  }

  /** Angular lifecycle hook for service destruction */
  ngOnDestroy(): void {
    this.unsubscribe();
  }
}
