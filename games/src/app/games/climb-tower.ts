import { createQuestion, Level, Question } from './math-games';
import { pick, Random } from './random';

export type ClimbModeId = 'true-or-false' | 'which-one';
export const CLIMB_MODE_IDS: readonly ClimbModeId[] = ['true-or-false', 'which-one'];

export type Side = 'left' | 'right';
export const SIDES: readonly Side[] = ['left', 'right'];

export interface JudgeStep {
  readonly kind: 'judge';
  readonly question: Question;
}

export interface PickStep {
  readonly kind: 'pick';
  readonly result: number;
  readonly equations: Readonly<Record<Side, Question>>;
  readonly rightSide: Side;
}

export type ClimbStep = JudgeStep | PickStep;

const CLOSE_TRIES = 40;

const closeEnough = (result: number, other: number): boolean =>
  Math.abs(result - other) <= Math.max(3, Math.round(result / 5));

function wrongEquation(level: Level, result: number, random: Random): Question {
  let fallback: Question | null = null;
  for (let tries = 0; tries < CLOSE_TRIES; tries++) {
    const question = createQuestion(level, random);
    if (question.answer === result) {
      continue;
    }
    if (closeEnough(result, question.answer)) {
      return question;
    }
    fallback ??= question;
  }
  return fallback ?? { ...createQuestion(level, random), answer: result + 1 };
}

export function pickStep(level: Level, random: Random): PickStep {
  const right = createQuestion(level, random);
  const wrong = wrongEquation(level, right.answer, random);
  const rightSide = pick(SIDES, random);
  return {
    kind: 'pick',
    result: right.answer,
    equations: rightSide === 'left' ? { left: right, right: wrong } : { left: wrong, right: right },
    rightSide,
  };
}

export function climbStep(mode: ClimbModeId, level: Level, random: Random): ClimbStep {
  return mode === 'which-one' ? pickStep(level, random) : { kind: 'judge', question: createQuestion(level, random) };
}
