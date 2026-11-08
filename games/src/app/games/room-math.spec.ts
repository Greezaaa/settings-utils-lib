import { describe, expect, it } from 'vitest';
import { createQuestion, getLevel } from './math-games';
import { seededRandom } from './random';
import { levelIdsFor, roomMath } from './room-math';

describe('room math', () => {
  it('keeps known settings and falls back for unknown ones', () => {
    expect(roomMath('your-answer', 'hard')).toEqual({ style: 'your-answer', levelId: 'hard' });
    expect(roomMath('find-the-signs', 'advanced')).toEqual({ style: 'find-the-signs', levelId: 'normal' });
    expect(roomMath('chess', 'impossible')).toEqual({ style: 'true-or-false', levelId: 'normal' });
    expect(levelIdsFor('find-the-signs')).not.toContain('advanced');
  });

  it('gives every player in a room the same questions from the same seed', () => {
    const questions = (seed: number) => {
      const random = seededRandom(seed);
      return Array.from({ length: 5 }, () => createQuestion(getLevel('normal'), random));
    };
    expect(questions(123)).toEqual(questions(123));
    expect(questions(123)).not.toEqual(questions(124));
  });
});
