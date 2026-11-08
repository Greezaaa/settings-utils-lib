import { between, pick, Random, shuffled } from './random';

/**
 * Measure it: rules only, no Angular, so they can be tested on their own.
 *
 * - Read the angle: a protractor (0 to 180°) shows a ray; slide to the angle it makes.
 * - Make the angle: turn the ray to a given angle, with fewer marks on the protractor as levels go up.
 * - Glass of water: how full is the glass? Pick the fraction (on the hardest level, 2 to 10 glasses, written as
 *   improper fractions like 7/2).
 * - Number line: only its ends are labelled; slide to the number at the mark.
 */
export type MeasureModeId =
  | 'read-angle'
  | 'set-angle'
  | 'fill-glass'
  | 'number-line';
export const MEASURE_MODE_IDS: readonly MeasureModeId[] = [
  'read-angle',
  'set-angle',
  'fill-glass',
  'number-line',
];

export type MeasureLevelId = 'easy' | 'normal' | 'hard' | 'expert';
export const MEASURE_LEVEL_IDS: readonly MeasureLevelId[] = [
  'easy',
  'normal',
  'hard',
  'expert',
];

/** Exercises in one single-player game */
export const EXERCISES_PER_GAME = 10;

// Angles

export interface AngleLevel {
  /** Angles are multiples of this, between it and 180 minus it */
  readonly multipleOf: number;
  /** How far off an answer may be, in degrees */
  readonly tolerance: number;
  /** Make the angle: the marks the protractor shows (every n degrees; 0 = none) and whether they have numbers */
  readonly marksEvery: number;
  readonly markLabels: boolean;
  /** How many degrees the slider moves at a time */
  readonly step: number;
}

export const ANGLE_LEVELS: Readonly<Record<MeasureLevelId, AngleLevel>> = {
  easy: {
    multipleOf: 30,
    tolerance: 5,
    marksEvery: 30,
    markLabels: true,
    step: 5,
  },
  normal: {
    multipleOf: 10,
    tolerance: 5,
    marksEvery: 30,
    markLabels: false,
    step: 5,
  },
  hard: {
    multipleOf: 5,
    tolerance: 3,
    marksEvery: 90,
    markLabels: false,
    step: 5,
  },
  expert: {
    multipleOf: 1,
    tolerance: 2,
    marksEvery: 0,
    markLabels: false,
    step: 1,
  },
};

export interface AngleExercise {
  readonly kind: 'angle';
  /** Degrees, from the protractor's 0 on the right, counterclockwise */
  readonly angle: number;
  readonly level: AngleLevel;
}

export function angleExercise(
  levelId: MeasureLevelId,
  random: Random
): AngleExercise {
  const level = ANGLE_LEVELS[levelId];
  const steps = Math.floor(180 / level.multipleOf) - 1;
  return {
    kind: 'angle',
    angle: between({ min: 1, max: steps }, random) * level.multipleOf,
    level,
  };
}

export const isAngleRight = (
  { angle, level }: AngleExercise,
  answer: number
): boolean => Math.abs(answer - angle) <= level.tolerance;

// Glasses

/** A fraction of a glass, possibly with whole glasses before it (1 ½) */
export interface Fill {
  readonly whole: number;
  readonly numerator: number;
  readonly denominator: number;
}

interface GlassLevel {
  readonly denominators: readonly number[];
  /** Whole full glasses that can come before the fraction */
  readonly wholes: readonly number[];
  readonly choices: number;
  /** Fractions written improper (7/2, not 3 ½), with the wrong choices close to the right one */
  readonly improper: boolean;
}

const GLASS_LEVELS: Readonly<Record<MeasureLevelId, GlassLevel>> = {
  easy: { denominators: [2, 4], wholes: [0], choices: 3, improper: false },
  normal: { denominators: [2, 3, 4], wholes: [0], choices: 4, improper: false },
  hard: {
    denominators: [3, 4, 5, 6, 8],
    wholes: [0],
    choices: 4,
    improper: false,
  },
  // 1 to 9 full glasses, so 2 to 10 glasses in all
  expert: {
    denominators: [2, 3, 4],
    wholes: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    choices: 4,
    improper: true,
  },
};

export interface GlassExercise {
  readonly kind: 'glass';
  readonly fill: Fill;
  /** The answers to choose from, the right one among them */
  readonly choices: readonly Fill[];
  /** Written as improper fractions (7/2), not mixed numbers (3 ½) */
  readonly improper: boolean;
}

/** How a fill is written: whole glasses (null when none, or when improper), then the fraction */
export interface FillParts {
  readonly whole: number | null;
  readonly numerator: number;
  readonly denominator: number;
}

export function fillParts(
  { whole, numerator, denominator }: Fill,
  improper: boolean
): FillParts {
  if (improper) {
    return {
      whole: null,
      numerator: whole * denominator + numerator,
      denominator,
    };
  }
  return { whole: whole > 0 ? whole : null, numerator, denominator };
}

/** A fill as text: `3/4`, `1 1/2`, or improper `7/2` */
export function formatFill(fill: Fill, improper: boolean): string {
  const { whole, numerator, denominator } = fillParts(fill, improper);
  return `${whole === null ? '' : `${whole} `}${numerator}/${denominator}`;
}

const fillValue = ({ whole, numerator, denominator }: Fill): number =>
  whole + numerator / denominator;

const greatestDivisor = (first: number, second: number): number =>
  second === 0 ? first : greatestDivisor(second, first % second);

/** All fractions of a level in lowest terms (½, not 2/4) */
function levelFills({ denominators, wholes }: GlassLevel): Fill[] {
  const fills = wholes.flatMap(whole =>
    denominators.flatMap(denominator =>
      Array.from({ length: denominator - 1 }, (_, index) => index + 1)
        .filter(numerator => greatestDivisor(numerator, denominator) === 1)
        .map(numerator => ({ whole, numerator, denominator }))
    )
  );
  // One of each value
  return fills.filter(
    (fill, index) =>
      fills.findIndex(other => fillValue(other) === fillValue(fill)) === index
  );
}

export function glassExercise(
  levelId: MeasureLevelId,
  random: Random
): GlassExercise {
  const level = GLASS_LEVELS[levelId];
  const fills = levelFills(level);
  const fill = pick(fills, random);
  const distance = (other: Fill): number =>
    Math.abs(fillValue(other) - fillValue(fill));
  const wrong = shuffled(
    fills.filter(other => fillValue(other) !== fillValue(fill)),
    random
  );
  // Close wrong answers, so counting the full glasses isn't enough (the sort keeps the shuffled order on ties)
  const others = (
    level.improper
      ? wrong.sort((first, second) => distance(first) - distance(second))
      : wrong
  ).slice(0, level.choices - 1);
  const choices = [fill, ...others].sort(
    (first, second) => fillValue(first) - fillValue(second)
  );
  return { kind: 'glass', fill, choices, improper: level.improper };
}

export const isSameFill = (first: Fill, second: Fill): boolean =>
  fillValue(first) === fillValue(second);

// Number lines

interface LineLevel {
  readonly steps: readonly number[];
  /** The first number is a multiple of the step, from these many steps below zero to above */
  readonly startSteps: { readonly min: number; readonly max: number };
  readonly gaps: { readonly min: number; readonly max: number };
}

const LINE_LEVELS: Readonly<Record<MeasureLevelId, LineLevel>> = {
  easy: {
    steps: [1],
    startSteps: { min: 0, max: 5 },
    gaps: { min: 5, max: 8 },
  },
  normal: {
    steps: [2, 5],
    startSteps: { min: 0, max: 6 },
    gaps: { min: 5, max: 9 },
  },
  hard: {
    steps: [10, 25, 50],
    startSteps: { min: 0, max: 8 },
    gaps: { min: 6, max: 10 },
  },
  expert: {
    steps: [0.5, 0.25],
    startSteps: { min: -12, max: 4 },
    gaps: { min: 6, max: 10 },
  },
};

export interface LineExercise {
  readonly kind: 'line';
  readonly start: number;
  readonly step: number;
  /** Spaces between the ends; the line has one more tick than this */
  readonly gaps: number;
  /** The tick with the mark, never an end */
  readonly mark: number;
  /**
   * The slider's ends: a random few steps past the line's ends, so its thumb never lines up with the drawing and the
   * answer has to be worked out, not matched by eye
   */
  readonly slider: { readonly min: number; readonly max: number };
}

/** How many steps past each end of the line the slider may reach */
const SLIDER_EXTRA_STEPS = { min: 2, max: 8 };

export function lineExercise(
  levelId: MeasureLevelId,
  random: Random
): LineExercise {
  const level = LINE_LEVELS[levelId];
  const step = pick(level.steps, random);
  const gaps = between(level.gaps, random);
  const start = between(level.startSteps, random) * step;
  // Below zero only on levels whose lines go there
  const lowest = level.startSteps.min < 0 ? -Infinity : 0;
  return {
    kind: 'line',
    step,
    start,
    gaps,
    mark: between({ min: 1, max: gaps - 1 }, random),
    slider: {
      min: Math.max(lowest, start - between(SLIDER_EXTRA_STEPS, random) * step),
      max: start + (gaps + between(SLIDER_EXTRA_STEPS, random)) * step,
    },
  };
}

/** The number at a tick of a line */
export const lineValue = (
  { start, step }: LineExercise,
  tick: number
): number => start + step * tick;

/** The line's last number */
export const lineEnd = (exercise: LineExercise): number =>
  lineValue(exercise, exercise.gaps);

export const isLineRight = (exercise: LineExercise, answer: number): boolean =>
  Math.abs(answer - lineValue(exercise, exercise.mark)) < exercise.step / 2;

// All modes

export type MeasureExercise = AngleExercise | GlassExercise | LineExercise;

/** One exercise of a mode and level */
export function measureExercise(
  mode: MeasureModeId,
  level: MeasureLevelId,
  random: Random
): MeasureExercise {
  switch (mode) {
    case 'fill-glass':
      return glassExercise(level, random);
    case 'number-line':
      return lineExercise(level, random);
    default:
      return angleExercise(level, random);
  }
}

/** `count` exercises in a row, from the same random numbers (a room's seed gives every player the same list) */
export function measureExercises(
  mode: MeasureModeId,
  level: MeasureLevelId,
  random: Random,
  count = EXERCISES_PER_GAME
): MeasureExercise[] {
  return Array.from({ length: count }, () =>
    measureExercise(mode, level, random)
  );
}

/** Which way a wrong slider answer is off, for the hint: the right answer is more, or less */
export type AimHint = 'more' | 'less';

/** The right value of a slider exercise (an angle's degrees, the number at a line's mark) */
export const rightValue = (exercise: AngleExercise | LineExercise): number =>
  exercise.kind === 'angle'
    ? exercise.angle
    : lineValue(exercise, exercise.mark);

export const aimHint = (
  exercise: AngleExercise | LineExercise,
  answer: number
): AimHint => (rightValue(exercise) > answer ? 'more' : 'less');
