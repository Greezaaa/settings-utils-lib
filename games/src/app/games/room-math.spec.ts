import { describe, expect, it } from 'vitest';
import { createQuestion, getLevel } from './math-games';
import { seededRandom } from './random';
import { levelIdsFor, roomExercises, roomMath } from './room-math';

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

  it('builds the same list of exercises from the same seed, for every answer style', () => {
    for (const style of ['true-or-false', 'your-answer', 'find-the-signs'] as const) {
      const math = roomMath(style, 'normal');
      const list = roomExercises(math, 99, 50);
      expect(list).toHaveLength(50);
      expect(roomExercises(math, 99, 50)).toEqual(list);
      expect(roomExercises(math, 100, 50)).not.toEqual(list);
    }
  });
});
