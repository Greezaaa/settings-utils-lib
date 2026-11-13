import { LevelId, Operator, Timing } from './math-games';
import { between, NumberRange, pick, Random } from './random';

export type SignsLevelId = Exclude<LevelId, 'advanced'>;

export interface SignsLevel extends Timing {
  readonly id: SignsLevelId;
  readonly operators: readonly Operator[];
  readonly numbers: NumberRange;
  readonly counts: readonly number[];
  readonly maxResult: number;
}

export interface SignsPuzzle {
  readonly numbers: readonly number[];
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

export const MISSING_SIGN = '?';

const MAX_ATTEMPTS = 1000;

const QUOTIENTS: NumberRange = { min: 2, max: 9 };

export function getSignsLevel(id: LevelId): SignsLevel {
  const level = SIGNS_LEVELS.find((item) => item.id === id);
  if (!level) {
    throw new Error(`Unknown Find the signs level: ${id}`);
  }
  return level;
}

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

export function solves(puzzle: SignsPuzzle, signs: readonly Operator[]): boolean {
  return signs.length === puzzle.operators.length && evaluate(puzzle.numbers, signs) === puzzle.result;
}

export function createSignsPuzzle(level: SignsLevel, random: Random = Math.random): SignsPuzzle {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const count = pick(level.counts, random);
    const operators = Array.from({ length: count - 1 }, () => pick(level.operators, random));
    const numbers = Array.from({ length: count }, () => between(level.numbers, random));
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
