import { between, NumberRange, pick, Random } from './random';

export type Operator = '+' | '−' | '×' | '÷';

export type LevelId = 'easy' | 'normal' | 'hard' | 'advanced' | 'expert';

export type TimerId = 'timer' | 'no-timer';

export type AnswerStyleId = 'true-or-false' | 'your-answer' | 'find-the-signs';

export interface Operation {
  readonly operator: Operator;
  readonly left: NumberRange;
  readonly right: NumberRange;
}

export interface Timing {
  readonly startSeconds: number;
  readonly minSeconds: number;
}

export interface Level extends Timing {
  readonly id: LevelId;
  readonly operations: readonly Operation[];
}

const UP_TO_20: NumberRange = { min: 1, max: 20 };
const ONE_DIGIT: NumberRange = { min: 2, max: 9 };
const TWO_DIGITS: NumberRange = { min: 10, max: 99 };
const TWO_OR_THREE_DIGITS: NumberRange = { min: 10, max: 999 };
const TIMES_TABLES: NumberRange = { min: 2, max: 12 };
const EXPERT_FACTORS: NumberRange = { min: 10, max: 31 };

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

const SECONDS_SAVED_PER_POINT = 0.2;

const TYPING_TIME_FACTOR = 1.5;

const NEAR_MISSES = [1, 2, 10] as const;

export interface Question {
  readonly left: number;
  readonly operator: Operator;
  readonly right: number;
  readonly shown: number;
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

export const formatQuestion = ({ left, operator, right, shown }: Question): string =>
  `${left} ${operator} ${right} = ${shown}`;

export const formatSolution = (question: Question): string => formatQuestion({ ...question, shown: question.answer });

export const formatPrompt = (question: Question): string => `${formatExpression(question)} =`;

export const formatExpression = ({ left, operator, right }: Question): string => `${left} ${operator} ${right}`;

export function secondsForQuestion(timing: Timing, score: number, answerStyle: AnswerStyleId): number {
  const seconds = Math.max(timing.minSeconds, timing.startSeconds - score * SECONDS_SAVED_PER_POINT);
  return answerStyle === 'your-answer' ? seconds * TYPING_TIME_FACTOR : seconds;
}

export function isCorrectAnswer(question: Question, typed: string): boolean {
  const trimmed = typed.trim();
  return /^\d+$/.test(trimmed) && Number(trimmed) === question.answer;
}

export function createQuestion(level: Level, random: Random = Math.random): Question {
  const operation = pick(level.operations, random);
  const { left, right, answer } = solve(operation, random);
  const shown = random() < 0.5 ? answer : nearMiss(answer, random);
  return { left, operator: operation.operator, right, shown, answer };
}

function solve({ operator, left, right }: Operation, random: Random): Omit<Question, 'operator' | 'shown'> {
  const first = between(left, random);
  const second = between(right, random);
  switch (operator) {
    case '+':
      return { left: first, right: second, answer: first + second };
    case '−': {
      const [bigger, smaller] = first >= second ? [first, second] : [second, first];
      return { left: bigger, right: smaller, answer: bigger - smaller };
    }
    case '×':
      return { left: first, right: second, answer: first * second };
    case '÷':
      return { left: first * second, right: second, answer: first };
  }
}

function nearMiss(answer: number, random: Random): number {
  const distance = pick(NEAR_MISSES, random);
  const goesDown = random() < 0.5 && answer - distance >= 0;
  return goesDown ? answer - distance : answer + distance;
}
