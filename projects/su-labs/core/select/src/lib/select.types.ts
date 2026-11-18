/** One choice in a select */
export interface SuSelectOption<T> {
  /** What the select's value becomes when this option is chosen */
  readonly value: T;
  /** The text shown, searched and matched by type-ahead */
  readonly label: string;
  /** Shown but can't be chosen @default false */
  readonly disabled?: boolean;
  /** The heading it's listed under; options of a group should follow one another */
  readonly group?: string;
}

/** Where to move the active option */
export type SuSelectMove = 'next' | 'previous' | 'first' | 'last';

/** An option with its index among the visible options */
export interface SuSelectIndexedOption<T> {
  readonly option: SuSelectOption<T>;
  readonly index: number;
}

/** Consecutive options under one heading; `label` is undefined for options without a group */
export interface SuSelectGroup<T> {
  readonly label: string | undefined;
  readonly options: readonly SuSelectIndexedOption<T>[];
}

/** How a select starts and behaves */
export interface SuSelectOptions<T> {
  /** The choices @default [] */
  readonly options?: readonly SuSelectOption<T>[];
  /** The chosen value @default null */
  readonly value?: T | null;
  /** Milliseconds between keys that still count as one type-ahead word @default 500 */
  readonly typeAheadDelay?: number;
  /** Whether two values are the same @default Object.is */
  readonly compare?: (a: T, b: T) => boolean;
}

/** A select's state */
export interface SuSelectState<T> {
  /** Whether the list is open */
  readonly open: boolean;
  /** The chosen value, or `null` */
  readonly value: T | null;
  /** The search text */
  readonly query: string;
  /** The options matching `query`, in order */
  readonly visible: readonly SuSelectOption<T>[];
  /** The index in `visible` of the option the keyboard is on, or -1 */
  readonly active: number;
}

/** The texts a select shows or reads out, replaceable for other languages */
export interface SuSelectLabels {
  /** Shown while nothing is chosen */
  readonly placeholder: string;
  /** The search field's placeholder and name for screen readers */
  readonly search: string;
  /** Shown when no option matches the search */
  readonly empty: string;
}
