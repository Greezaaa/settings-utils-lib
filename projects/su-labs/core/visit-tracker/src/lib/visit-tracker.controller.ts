import { createSuStore, isBrowser, SuReadableStore } from '@su-labs/core';
import { SuVisitData, SuVisitState, SuVisitTrackerConfig } from './visit-tracker.types';

/** Milestones used when none are configured */
const DEFAULT_MILESTONES: readonly number[] = [10, 100];

/** State before `init()` runs */
const INITIAL_STATE: SuVisitState = { count: 0, lastVisit: null, milestone: null };

/** Saved visit data as it may appear in localStorage (older data can hold `lastVisit: null`) */
type StoredVisitData = { count?: number; lastVisit?: string | null };

/**
 * Framework-agnostic visit tracker.
 *
 * Counts visits in localStorage, remembers when the previous visit started and flags
 * milestone visits. The result is exposed as a reactive store.
 * Safe to import in Node: without a browser, `init()` leaves the state unchanged.
 */
export class SuVisitTrackerController {
  /** localStorage key for the visit data */
  private storageKey = 'su:visits';

  /** Visit numbers flagged as milestones */
  private milestones: readonly number[] = DEFAULT_MILESTONES;

  private readonly visitStore = createSuStore<SuVisitState>(INITIAL_STATE);

  /** Reactive, read-only access to the current visit */
  readonly visit: SuReadableStore<SuVisitState> = this.visitStore.asReadonly();

  /**
   * Record a visit: increase the saved count, read the previous visit date and
   * check for a milestone. Call once per page load.
   * @param config Optional storage key and milestones.
   */
  init(config: SuVisitTrackerConfig = {}): void {
    this.storageKey = config.storageKey || this.storageKey;
    this.milestones = config.milestoneVisits ?? this.milestones;

    if (!isBrowser()) {
      return;
    }

    const previous = this.readFromStorage();
    const count = (previous.count ?? 0) + 1;

    this.visitStore.set({
      count,
      lastVisit: previous.lastVisit ?? null,
      milestone: this.milestones.includes(count) ? count : null,
    });

    const data: SuVisitData = { count, lastVisit: new Date().toISOString() };
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  /** Saved visit data, or an empty object when nothing valid is saved */
  private readFromStorage(): StoredVisitData {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(this.storageKey) ?? '{}');
      return isVisitData(stored) ? stored : {};
    } catch {
      return {};
    }
  }
}

/** Check that parsed JSON has the shape of saved visit data */
function isVisitData(value: unknown): value is StoredVisitData {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const count = 'count' in value ? value.count : undefined;
  const lastVisit = 'lastVisit' in value ? value.lastVisit : undefined;
  return (count === undefined || Number.isFinite(count)) && (lastVisit == null || typeof lastVisit === 'string');
}
