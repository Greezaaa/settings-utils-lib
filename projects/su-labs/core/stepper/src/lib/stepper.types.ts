/** Which way the steps run: in a row above the content, or in a column beside it */
export type SuStepperOrientation = 'horizontal' | 'vertical';

/**
 * Where a step stands:
 * - `current`: on screen
 * - `completed`: left forward and still allows going forward, or marked `completed` in its options
 * - `visited`: seen, but not (or no longer) completed
 * - `upcoming`: not seen yet
 */
export type SuStepStatus = 'current' | 'completed' | 'visited' | 'upcoming';

/** One step: its label and the rules for leaving it */
export interface SuStepOptions {
  /** The text beside the step's number; without it, only the number shows */
  readonly label?: string;
  /** The user may go forward from this step, e.g. once its form is valid @default true */
  readonly canNext?: boolean;
  /** The user may go back from this step @default true */
  readonly canBack?: boolean;
  /** The step can't be visited; moving forward or back skips it @default false */
  readonly disabled?: boolean;
  /** Shows the step as completed whatever the user does here, e.g. for work saved earlier @default false */
  readonly completed?: boolean;
}

/** A stepper's steps and how the user may move between them */
export interface SuStepperOptions {
  readonly steps?: readonly SuStepOptions[];
  /** The step shown first, from 0 @default 0 */
  readonly start?: number;
  /** Going forward by more than one step only reaches steps already visited @default false */
  readonly linear?: boolean;
}

/** One step as shown, with every option resolved */
export interface SuStepView {
  /** From 0 */
  readonly index: number;
  /** From 1, as shown in the step's circle */
  readonly number: number;
  readonly label: string | null;
  readonly status: SuStepStatus;
  readonly current: boolean;
  readonly completed: boolean;
  readonly visited: boolean;
  readonly disabled: boolean;
  readonly canNext: boolean;
  readonly canBack: boolean;
  /** The user may go to it from the current step right now */
  readonly reachable: boolean;
}

/** The whole stepper */
export interface SuStepperState {
  readonly steps: readonly SuStepView[];
  /** The step on screen, from 0 */
  readonly current: number;
  readonly count: number;
  readonly isFirst: boolean;
  readonly isLast: boolean;
  /** `next()` would move */
  readonly canNext: boolean;
  /** `back()` would move */
  readonly canBack: boolean;
}

/** The texts a stepper shows or reads out, e.g. in the page's language */
export interface SuStepperLabels {
  /** The name of the list of steps */
  readonly steps: string;
  /** Read out before each step's label */
  readonly step: (number: number, count: number) => string;
  readonly completed: string;
  readonly unavailable: string;
  readonly back: string;
  readonly next: string;
}
