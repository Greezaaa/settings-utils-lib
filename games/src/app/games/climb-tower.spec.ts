import { describe, expect, it } from 'vitest';
import { climbStep, pickStep } from './climb-tower';
import { getLevel, LEVELS } from './math-games';
import { seededRandom } from './random';

describe('climb the tower', () => {
  it('puts the result’s equation on one side and a different one on the other', () => {
    for (const level of LEVELS) {
      const random = seededRandom(1);
      for (let index = 0; index < 50; index++) {
        const { result, equations, rightSide } = pickStep(level, random);
        const wrongSide = rightSide === 'left' ? 'right' : 'left';
        expect(equations[rightSide].answer).toBe(result);
        expect(equations[wrongSide].answer).not.toBe(result);
      }
    }
  });

  it('keeps the wrong equation close to the result on easy levels', () => {
    const random = seededRandom(2);
    for (let index = 0; index < 50; index++) {
      const { result, equations, rightSide } = pickStep(getLevel('easy'), random);
      const wrong = equations[rightSide === 'left' ? 'right' : 'left'];
      expect(Math.abs(wrong.answer - result)).toBeLessThanOrEqual(Math.max(3, Math.round(result / 5)));
    }
  });

  it('gives each mode its kind of step', () => {
    expect(climbStep('true-or-false', getLevel('normal'), seededRandom(3)).kind).toBe('judge');
    expect(climbStep('which-one', getLevel('normal'), seededRandom(3)).kind).toBe('pick');
  });
});
