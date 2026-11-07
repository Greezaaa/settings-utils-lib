import { describe, expect, it } from 'vitest';
import { createSignsPuzzle, evaluate, formatSigns, getSignsLevel, SIGNS_LEVELS, SignsPuzzle, solves } from './find-the-signs';

const RUNS = 1000;

describe('find the signs rules', () => {
  it('works out × and ÷ before + and −', () => {
    expect(evaluate([4, 5, 5], ['+', '×'])).toBe(29);
    expect(evaluate([20, 4, 2], ['−', '÷'])).toBe(18);
    expect(evaluate([6, 2, 3, 1], ['×', '÷', '+'])).toBe(5);
  });

  it('rejects remainders and totals below zero', () => {
    expect(evaluate([7, 2], ['÷'])).toBeNull();
    expect(evaluate([3, 5, 9], ['−', '+'])).toBeNull();
  });

  it('accepts any signs that make the equation true', () => {
    const puzzle: SignsPuzzle = { numbers: [2, 2, 4], operators: ['+', '+'], result: 8 };
    expect(solves(puzzle, ['+', '+'])).toBe(true);
    expect(solves(puzzle, ['×', '+'])).toBe(true);
    expect(solves(puzzle, ['−', '+'])).toBe(false);
    expect(solves(puzzle, ['+'])).toBe(false);
  });

  it('shows missing signs as question marks', () => {
    expect(formatSigns([4, 5, 5], [null, null], 14)).toBe('4 ? 5 ? 5 = 14');
    expect(formatSigns([4, 5, 5], ['+', null], 14)).toBe('4 + 5 ? 5 = 14');
  });

  it.each(SIGNS_LEVELS.map((level) => [level.id, level] as const))(
    'builds solvable %s puzzles within limits',
    (_, level) => {
      for (let run = 0; run < RUNS; run++) {
        const puzzle = createSignsPuzzle(level);
        expect(level.counts).toContain(puzzle.numbers.length);
        expect(puzzle.operators.every((operator) => level.operators.includes(operator))).toBe(true);
        expect(solves(puzzle, puzzle.operators)).toBe(true);
        expect(puzzle.result).toBeLessThanOrEqual(level.maxResult);
      }
    },
  );

  it('keeps easy numbers and results up to 20', () => {
    for (let run = 0; run < RUNS; run++) {
      const { numbers, result } = createSignsPuzzle(getSignsLevel('easy'));
      expect(Math.max(...numbers, result)).toBeLessThanOrEqual(20);
    }
  });

  it('uses all four signs and two or three gaps in expert', () => {
    const operators = new Set<string>();
    const gaps = new Set<number>();
    for (let run = 0; run < RUNS; run++) {
      const puzzle = createSignsPuzzle(getSignsLevel('expert'));
      puzzle.operators.forEach((operator) => operators.add(operator));
      gaps.add(puzzle.operators.length);
    }
    expect([...operators].sort()).toEqual(['+', '×', '÷', '−'].sort());
    expect([...gaps].sort()).toEqual([2, 3]);
  });
});
