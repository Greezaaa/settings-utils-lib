/**
 * Rules and settings of the "Math games": an equation is shown and the player says whether its result is true
 * or false, types the result, or finds its missing signs (see find-the-signs.ts). The first mistake ends the
 * game, and so does a timeout when the timer is on. Pure functions only, so the page stays a thin view and the
 * rules are easy to test.
 */

import { between, NumberRange, pick, Random } from './random';

export type Operator = '+' | '−' | '×' | '÷';

export type LevelId = 'easy' | 'normal' | 'hard' | 'advanced' | 'expert';

/** Whether a game is played against the clock */
export type TimerId = 'timer' | 'no-timer';

/** How the player answers: judge a shown result, type it, or find the missing signs */
export type AnswerStyleId = 'true-or-false' | 'your-answer' | 'find-the-signs';

/**
 * Which numbers an operator uses.
 * For ÷, `left` is the quotient and `right` the divisor, so every division comes out even.
 */
export interface Operation {
  readonly operator: Operator;
  readonly left: NumberRange;
  readonly right: NumberRange;
}

/** How much time each question gets when the timer is on */
export interface Timing {
  /** Seconds for the first question */
  readonly startSeconds: number;
  /** Seconds the timer never goes below, however high the score */
  readonly minSeconds: number;
}

/**
 * A level of the true-or-false and your-answer games: which operations to ask.
 * Rules hold ids only; names and descriptions are translated by the page.
 */
export interface Level extends Timing {
  readonly id: LevelId;
  readonly operations: readonly Operation[];
}

const UP_TO_20: NumberRange = { min: 1, max: 20 };
const ONE_DIGIT: NumberRange = { min: 2, max: 9 };
const TWO_DIGITS: NumberRange = { min: 10, max: 99 };
const TWO_OR_THREE_DIGITS: NumberRange = { min: 10, max: 999 };
const TIMES_TABLES: NumberRange = { min: 2, max: 12 };
/** Two-digit factors whose products stay at three digits, so expert × and ÷ remain mental math */
const EXPERT_FACTORS: NumberRange = { min: 10, max: 31 };

/** + and − with the same numbers on both sides */
const addAndSubtract = (range: NumberRange): Operation[] => [
  { operator: '+', left: range, right: range },
  { operator: '−', left: range, right: range },
];

export const LEVELS: readonly Level[] = [
  {
    id: 'easy',
    operations: addAndSubtract(UP_TO_20),
    startSeconds: 8,
    minSeconds: 4,
  },
  {
    id: 'normal',
    operations: addAndSubtract(TWO_DIGITS),
    startSeconds: 6,
    minSeconds: 3,
  },
  {
    id: 'hard',
    operations: [...addAndSubtract(TWO_DIGITS), { operator: '×', left: TIMES_TABLES, right: TIMES_TABLES }],
    startSeconds: 5,
    minSeconds: 2.5,
  },
  {
    id: 'advanced',
    operations: [
      { operator: '×', left: ONE_DIGIT, right: ONE_DIGIT },
      { operator: '÷', left: ONE_DIGIT, right: ONE_DIGIT },
    ],
    startSeconds: 6,
    minSeconds: 3,
  },
  {
    id: 'expert',
    operations: [
      ...addAndSubtract(TWO_OR_THREE_DIGITS),
      { operator: '×', left: EXPERT_FACTORS, right: EXPERT_FACTORS },
      { operator: '÷', left: EXPERT_FACTORS, right: EXPERT_FACTORS },
    ],
    startSeconds: 10,
    minSeconds: 5,
  },
];

export const TIMER_IDS: readonly TimerId[] = ['timer', 'no-timer'];

export const ANSWER_STYLE_IDS: readonly AnswerStyleId[] = ['true-or-false', 'your-answer', 'find-the-signs'];

/** How much faster each correct answer makes the next question */
const SECONDS_SAVED_PER_POINT = 0.2;

/** Typing a result takes longer than tapping true or false */
const TYPING_TIME_FACTOR = 1.5;

/** Typical slips: off by one or two, or a forgotten carry */
const NEAR_MISSES = [1, 2, 10] as const;

/** One equation to judge */
export interface Question {
  readonly left: number;
  readonly operator: Operator;
  readonly right: number;
  /** Result shown to the player */
  readonly shown: number;
  /** Real result */
  readonly answer: number;
}

export function getLevel(id: LevelId): Level {
  const level = LEVELS.find((item) => item.id === id);
  if (!level) {
    throw new Error(`Unknown level: ${id}`);
  }
  return level;
}

export const isTrue = (question: Question): boolean => question.shown === question.answer;

/** The equation as the player reads it, e.g. `12 + 34 = 46` */
export const formatQuestion = ({ left, operator, right, shown }: Question): string =>
  `${left} ${operator} ${right} = ${shown}`;

/** The equation without its result, for the player to complete, e.g. `12 + 34 =` */
export const formatPrompt = ({ left, operator, right }: Question): string => `${left} ${operator} ${right} =`;

/**
 * Seconds for the next question: shorter as the score grows, but never under the level's minimum.
 * Typed answers get more time than true or false.
 */
export function secondsForQuestion(timing: Timing, score: number, answerStyle: AnswerStyleId): number {
  const seconds = Math.max(timing.minSeconds, timing.startSeconds - score * SECONDS_SAVED_PER_POINT);
  return answerStyle === 'your-answer' ? seconds * TYPING_TIME_FACTOR : seconds;
}

/** Whether a typed result is right; anything that isn't a whole number is wrong */
export function isCorrectAnswer(question: Question, typed: string): boolean {
  const trimmed = typed.trim();
  return /^\d+$/.test(trimmed) && Number(trimmed) === question.answer;
}

/** A new equation; about half of them show the right result */
export function createQuestion(level: Level, random: Random = Math.random): Question {
  const operation = pick(level.operations, random);
  const { left, right, answer } = solve(operation, random);
  const shown = random() < 0.5 ? answer : nearMiss(answer, random);
  return { left, operator: operation.operator, right, shown, answer };
}

/** Picks the numbers of an operation and works out its result */
function solve({ operator, left, right }: Operation, random: Random): Omit<Question, 'operator' | 'shown'> {
  const first = between(left, random);
  const second = between(right, random);
  switch (operator) {
    case '+':
      return { left: first, right: second, answer: first + second };
    case '−': {
      // Kids don't do negative numbers yet: subtract the smaller from the bigger
      const [bigger, smaller] = first >= second ? [first, second] : [second, first];
      return { left: bigger, right: smaller, answer: bigger - smaller };
    }
    case '×':
      return { left: first, right: second, answer: first * second };
    case '÷':
      // Built backwards from quotient × divisor so there is never a remainder
      return { left: first * second, right: second, answer: first };
  }
}

/** A wrong but believable result, never negative */
function nearMiss(answer: number, random: Random): number {
  const distance = pick(NEAR_MISSES, random);
  const goesDown = random() < 0.5 && answer - distance >= 0;
  return goesDown ? answer - distance : answer + distance;
}
