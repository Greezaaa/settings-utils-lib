import { describe, expect, it } from 'vitest';
import { ANGLE_LEVELS, angleExercise, glassExercise, isAngleRight, isLineRight, isSameFill, lineEnd, lineExercise, lineValue, MEASURE_LEVEL_IDS, MEASURE_MODE_IDS, measureExercises } from './measure-it';
import { seededRandom } from './random';

describe('measure it', () => {
  it('draws angles on each level’s multiples, never 0 or 180', () => {
    for (const level of MEASURE_LEVEL_IDS) {
      const random = seededRandom(1);
      for (let index = 0; index < 50; index++) {
        const { angle } = angleExercise(level, random);
        expect(angle % ANGLE_LEVELS[level].multipleOf).toBe(0);
        expect(angle).toBeGreaterThan(0);
        expect(angle).toBeLessThan(180);
      }
    }
  });

  it('accepts angles within the level’s tolerance', () => {
    const exercise = {
      kind: 'angle',
      angle: 60,
      level: ANGLE_LEVELS.easy,
    } as const;
    expect(isAngleRight(exercise, 64)).toBe(true);
    expect(isAngleRight(exercise, 66)).toBe(false);
  });

  it('offers the right fill among different choices, in lowest terms', () => {
    for (const level of MEASURE_LEVEL_IDS) {
      const random = seededRandom(3);
      for (let index = 0; index < 30; index++) {
        const { fill, choices } = glassExercise(level, random);
        expect(choices.filter(choice => isSameFill(choice, fill))).toHaveLength(
          1
        );
        const values = choices.map(
          ({ whole, numerator, denominator }) => whole + numerator / denominator
        );
        expect(new Set(values).size).toBe(choices.length);
        expect(values).toEqual(
          [...values].sort((first, second) => first - second)
        );
      }
    }
    expect(glassExercise('expert', seededRandom(5)).fill.whole).toBe(1);
  });

  it('marks a tick inside the number line and checks the answer', () => {
    const random = seededRandom(7);
    for (let index = 0; index < 50; index++) {
      const exercise = lineExercise('normal', random);
      expect(exercise.mark).toBeGreaterThan(0);
      expect(exercise.mark).toBeLessThan(exercise.gaps);
      expect(isLineRight(exercise, lineValue(exercise, exercise.mark))).toBe(
        true
      );
      expect(
        isLineRight(exercise, lineValue(exercise, exercise.mark + 1))
      ).toBe(false);
    }
    const line = { kind: 'line', start: 1, step: 1, gaps: 6, mark: 3 } as const;
    expect(lineEnd(line)).toBe(7);
    expect(lineValue(line, line.mark)).toBe(4);
  });

  it('gives the same exercises from the same seed, for every mode', () => {
    for (const mode of MEASURE_MODE_IDS) {
      expect(measureExercises(mode, 'normal', seededRandom(9))).toEqual(
        measureExercises(mode, 'normal', seededRandom(9))
      );
    }
  });
});
