/** Configuration options for the visit tracker */
export interface SuVisitTrackerConfig {
  /** Key used for storing visit data in localStorage (default: 'su:visits') */
  storageKey?: string;

  /** Visit numbers to flag as milestones, e.g. the 10th and 100th visit (default: [10, 100]) */
  milestoneVisits?: number[];
}

/** Shape of the data stored in localStorage */
export interface SuVisitData {
  /** Number of visits so far, including the current one */
  count: number;
  /** Start of the most recent visit as an ISO string */
  lastVisit: string;
}

/** Visit information for the current visit */
export interface SuVisitState {
  /** Number of visits so far, including the current one (0 before `init()`) */
  count: number;
  /** Start of the previous visit as an ISO string, or null on the first visit */
  lastVisit: string | null;
  /** The milestone reached on this visit, or null */
  milestone: number | null;
}
