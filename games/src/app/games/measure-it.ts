import { between, pick, Random, shuffled } from './random';

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

export const EXERCISES_PER_GAME = 10;

export interface AngleLevel {
  readonly multipleOf: number;
  readonly tolerance: number;
  readonly marksEvery: number;
  readonly markLabels: boolean;
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

export interface Fill {
  readonly whole: number;
  readonly numerator: number;
  readonly denominator: number;
}

interface GlassLevel {
  readonly denominators: readonly number[];
  readonly wholes: readonly number[];
  readonly choices: number;
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
  readonly choices: readonly Fill[];
  readonly improper: boolean;
}

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

export function formatFill(fill: Fill, improper: boolean): string {
  const { whole, numerator, denominator } = fillParts(fill, improper);
  return `${whole === null ? '' : `${whole} `}${numerator}/${denominator}`;
}

const fillValue = ({ whole, numerator, denominator }: Fill): number =>
  whole + numerator / denominator;

const greatestDivisor = (first: number, second: number): number =>
  second === 0 ? first : greatestDivisor(second, first % second);

function levelFills({ denominators, wholes }: GlassLevel): Fill[] {
  const fills = wholes.flatMap(whole =>
    denominators.flatMap(denominator =>
      Array.from({ length: denominator - 1 }, (_, index) => index + 1)
        .filter(numerator => greatestDivisor(numerator, denominator) === 1)
        .map(numerator => ({ whole, numerator, denominator }))
    )
  );
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

interface LineLevel {
  readonly steps: readonly number[];
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
  readonly gaps: number;
  readonly mark: number;
  readonly slider: { readonly min: number; readonly max: number };
}

const SLIDER_EXTRA_STEPS = { min: 2, max: 8 };

export function lineExercise(
  levelId: MeasureLevelId,
  random: Random
): LineExercise {
  const level = LINE_LEVELS[levelId];
  const step = pick(level.steps, random);
  const gaps = between(level.gaps, random);
  const start = between(level.startSteps, random) * step;
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

export const lineValue = (
  { start, step }: LineExercise,
  tick: number
): number => start + step * tick;

export const lineEnd = (exercise: LineExercise): number =>
  lineValue(exercise, exercise.gaps);

export const isLineRight = (exercise: LineExercise, answer: number): boolean =>
  Math.abs(answer - lineValue(exercise, exercise.mark)) < exercise.step / 2;

export type MeasureExercise = AngleExercise | GlassExercise | LineExercise;

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

export type AimHint = 'more' | 'less';

export const rightValue = (exercise: AngleExercise | LineExercise): number =>
  exercise.kind === 'angle'
    ? exercise.angle
    : lineValue(exercise, exercise.mark);

export const aimHint = (
  exercise: AngleExercise | LineExercise,
  answer: number
): AimHint => (rightValue(exercise) > answer ? 'more' : 'less');
