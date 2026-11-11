import { createQuestion, Level, Question } from './math-games';
import { pick, Random } from './random';

/**
 * Climb the tower: rules only, no Angular, so they can be tested on their own. Each right answer climbs a floor; the
 * first wrong one falls, and the game ends. The levels are the math games' levels.
 *
 * - True or false: an equation with a result; is it right?
 * - Which one: a result in the box, and two equations on two platforms; jump onto the one that makes it.
 */
export type ClimbModeId = 'true-or-false' | 'which-one';
export const CLIMB_MODE_IDS: readonly ClimbModeId[] = ['true-or-false', 'which-one'];

export type Side = 'left' | 'right';
export const SIDES: readonly Side[] = ['left', 'right'];

/** True or false: the equation as shown, with a right or wrong result */
export interface JudgeStep {
  readonly kind: 'judge';
  readonly question: Question;
}

/** Which one: the result, and an equation on each side; only one of them makes it */
export interface PickStep {
  readonly kind: 'pick';
  readonly result: number;
  readonly equations: Readonly<Record<Side, Question>>;
  readonly rightSide: Side;
}

export type ClimbStep = JudgeStep | PickStep;

/** Tries at finding a wrong equation close to the result, before taking any wrong one */
const CLOSE_TRIES = 40;

/** A wrong equation is close when its result is at most this far off, or a fifth of the result for big numbers */
const closeEnough = (result: number, other: number): boolean =>
  Math.abs(result - other) <= Math.max(3, Math.round(result / 5));

/** An equation of the level whose result isn't `result`, close to it when one turns up */
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
  // Every level has more than one result, so a different one always turns up; this only guards the loop
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
