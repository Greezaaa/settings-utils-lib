/**
 * Rules of "Find the signs": an equation with its signs missing, like `4 ? 5 ? 5 = 14`, which the player
 * completes with + − × ÷. Any signs that make the equation true count, not only the ones it was built with.
 * × and ÷ are worked out before + and −, as in normal math.
 */

import { LevelId, Operator, Timing } from './math-games';
import { between, NumberRange, pick, Random } from './random';

/** Find the signs has every level except advanced */
export type SignsLevelId = Exclude<LevelId, 'advanced'>;

/** A level of Find the signs: which signs, which numbers and how many of them */
export interface SignsLevel extends Timing {
  readonly id: SignsLevelId;
  readonly operators: readonly Operator[];
  readonly numbers: NumberRange;
  /** How many numbers an equation can have; one sign fewer than that is missing */
  readonly counts: readonly number[];
  /** Largest result, so easy levels stay small */
  readonly maxResult: number;
}

/** An equation with its signs missing */
export interface SignsPuzzle {
  readonly numbers: readonly number[];
  /** Signs the equation was built with; one correct answer among possibly several */
  readonly operators: readonly Operator[];
  readonly result: number;
}

export const SIGNS_LEVELS: readonly SignsLevel[] = [
  {
    id: 'easy',
    operators: ['+', '−'],
    numbers: { min: 1, max: 20 },
    counts: [3],
    maxResult: 20,
    startSeconds: 15,
    minSeconds: 8,
  },
  {
    id: 'normal',
    operators: ['+', '−'],
    numbers: { min: 1, max: 50 },
    counts: [3],
    maxResult: 100,
    startSeconds: 15,
    minSeconds: 8,
  },
  {
    id: 'hard',
    operators: ['+', '−', '×'],
    numbers: { min: 2, max: 12 },
    counts: [3],
    maxResult: 200,
    startSeconds: 18,
    minSeconds: 10,
  },
  {
    id: 'expert',
    operators: ['+', '−', '×', '÷'],
    numbers: { min: 2, max: 12 },
    counts: [3, 4],
    maxResult: 200,
    startSeconds: 25,
    minSeconds: 12,
  },
];

/** Sign shown in place of a missing one */
export const MISSING_SIGN = '?';

/** Attempts before giving up on random numbers; never reached in practice */
const MAX_ATTEMPTS = 1000;

/** How many times bigger a number before ÷ is than the one after it */
const QUOTIENTS: NumberRange = { min: 2, max: 9 };

export function getSignsLevel(id: LevelId): SignsLevel {
  const level = SIGNS_LEVELS.find((item) => item.id === id);
  if (!level) {
    throw new Error(`Unknown Find the signs level: ${id}`);
  }
  return level;
}

/**
 * The equation with the given signs, or `?` where one is still missing,
 * e.g. `4 + 5 ? 5 = 14`
 */
export function formatSigns(
  numbers: readonly number[],
  signs: readonly (Operator | null)[],
  result: number | string,
): string {
  const parts = numbers.flatMap((number, index) =>
    index === 0 ? [`${number}`] : [signs[index - 1] ?? MISSING_SIGN, `${number}`],
  );
  return `${parts.join(' ')} = ${result}`;
}

/**
 * The value of the numbers joined by these signs, × and ÷ first.
 * `null` when it can't be worked out with whole, non-negative numbers: a remainder or a total below zero.
 */
export function evaluate(numbers: readonly number[], operators: readonly Operator[]): number | null {
  const terms = [numbers[0]];
  const joins: ('+' | '−')[] = [];

  for (const [index, operator] of operators.entries()) {
    const number = numbers[index + 1];
    const last = terms.length - 1;
    if (operator === '×') {
      terms[last] *= number;
    } else if (operator === '÷') {
      if (terms[last] % number !== 0) {
        return null;
      }
      terms[last] /= number;
    } else {
      joins.push(operator);
      terms.push(number);
    }
  }

  let total = terms[0];
  for (const [index, join] of joins.entries()) {
    total = join === '+' ? total + terms[index + 1] : total - terms[index + 1];
    if (total < 0) {
      return null;
    }
  }
  return total;
}

/** Whether the player's signs make the equation true */
export function solves(puzzle: SignsPuzzle, signs: readonly Operator[]): boolean {
  return signs.length === puzzle.operators.length && evaluate(puzzle.numbers, signs) === puzzle.result;
}

/** A new equation that works out with whole, non-negative numbers within the level's limits */
export function createSignsPuzzle(level: SignsLevel, random: Random = Math.random): SignsPuzzle {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const count = pick(level.counts, random);
    const operators = Array.from({ length: count - 1 }, () => pick(level.operators, random));
    const numbers = Array.from({ length: count }, () => between(level.numbers, random));
    // Make each number before ÷ a multiple of the one after it, so most divisions come out even
    for (let index = operators.length - 1; index >= 0; index--) {
      if (operators[index] === '÷') {
        numbers[index] = numbers[index + 1] * between(QUOTIENTS, random);
      }
    }
    const result = evaluate(numbers, operators);
    if (result !== null && result <= level.maxResult) {
      return { numbers, operators, result };
    }
  }
  throw new Error(`Could not build a Find the signs puzzle for level ${level.id}`);
}
