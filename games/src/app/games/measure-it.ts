import { between, pick, Random, shuffled } from './random';

/**
 * Measure it: rules only, no Angular, so they can be tested on their own.
 *
 * - Read the angle: a protractor (0 to 180°) shows a ray; slide to the angle it makes.
 * - Make the angle: turn the ray to a given angle, with fewer marks on the protractor as levels go up.
 * - Glass of water: how full is the glass? Pick the fraction (two glasses on the hardest level: 1 ½…).
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
}

export const ANGLE_LEVELS: Readonly<Record<MeasureLevelId, AngleLevel>> = {
  easy: { multipleOf: 30, tolerance: 5, marksEvery: 30, markLabels: true },
  normal: { multipleOf: 10, tolerance: 5, marksEvery: 30, markLabels: false },
  hard: { multipleOf: 5, tolerance: 3, marksEvery: 90, markLabels: false },
  expert: { multipleOf: 1, tolerance: 2, marksEvery: 0, markLabels: false },
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
}

const GLASS_LEVELS: Readonly<Record<MeasureLevelId, GlassLevel>> = {
  easy: { denominators: [2, 4], wholes: [0], choices: 3 },
  normal: { denominators: [2, 3, 4], wholes: [0], choices: 4 },
  hard: { denominators: [3, 4, 5, 6, 8], wholes: [0], choices: 4 },
  expert: { denominators: [2, 3, 4], wholes: [1], choices: 4 },
};

export interface GlassExercise {
  readonly kind: 'glass';
  readonly fill: Fill;
  /** The answers to choose from, the right one among them */
  readonly choices: readonly Fill[];
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
  const others = shuffled(
    fills.filter(other => fillValue(other) !== fillValue(fill)),
    random
  ).slice(0, level.choices - 1);
  const choices = shuffled([fill, ...others], random).sort(
    (first, second) => fillValue(first) - fillValue(second)
  );
  return { kind: 'glass', fill, choices };
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
}

export function lineExercise(
  levelId: MeasureLevelId,
  random: Random
): LineExercise {
  const level = LINE_LEVELS[levelId];
  const step = pick(level.steps, random);
  const gaps = between(level.gaps, random);
  return {
    kind: 'line',
    step,
    start: between(level.startSteps, random) * step,
    gaps,
    mark: between({ min: 1, max: gaps - 1 }, random),
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
