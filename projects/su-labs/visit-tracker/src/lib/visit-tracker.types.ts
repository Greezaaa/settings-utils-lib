/**
 * Configuration options for SuVisitTrackerService
 */
export interface SuVisitTrackerConfig {
  /** Key used for storing visit data in localStorage (default: 'su:visits') */
  storageKey?: string;

  /** Milestones to track, e.g., 10th visit, 100th visit */
  milestoneVisits?: number[];
}

/**
 * Shape of the data stored in localStorage
 */
export interface SuVisitData {
  count: number;
  lastVisit: string; // ISO string
}
