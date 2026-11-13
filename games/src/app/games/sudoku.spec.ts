import { describe, expect, it } from 'vitest';
import { boxCells, countSolutions, dealSudoku, fullBoard, isSolved, repeatedCells, SUDOKU_SIZES } from './sudoku';
import { seededRandom } from './random';

describe('sudoku', () => {
  it('builds full boards with each symbol once in every row, column and box', () => {
    for (const size of SUDOKU_SIZES) {
      const board = fullBoard(size, seededRandom(size));
      expect(board).toHaveLength(size * size);
      expect(isSolved(board, size)).toBe(true);
      boxCells(size).forEach((box) => expect(new Set(box.map((cell) => board[cell])).size).toBe(size));
    }
  });

  it('splits each size into as many boxes as rows, each as big as a row', () => {
    for (const size of SUDOKU_SIZES) {
      const boxes = boxCells(size);
      expect(boxes).toHaveLength(size);
      boxes.forEach((box) => expect(box).toHaveLength(size));
    }
  });

  it('deals puzzles with empty cells, no repeated symbols and only one answer', () => {
    for (const size of SUDOKU_SIZES) {
      const { start } = dealSudoku(size, seededRandom(7));
      expect(start.filter((symbol) => symbol === null).length).toBeGreaterThan(size);
      expect(repeatedCells(start, size).size).toBe(0);
      expect(countSolutions(start, size, 2)).toBe(1);
    }
  });

  it('counts more than one answer on a board with too few symbols', () => {
    expect(countSolutions(Array<null>(16).fill(null), 4, 2)).toBe(2);
  });

  it('marks symbols repeated in a row, a column or a box', () => {
    // A . | . .
    // . A | . .   ← same box as the first A
    // ----+----
    // . . | . .
    // A . | . .   ← same column as the first A
    const board = [0, null, null, null, null, 0, null, null, null, null, null, null, 0, null, null, null];
    expect([...repeatedCells(board, 4)].sort((first, second) => first - second)).toEqual([0, 5, 12]);
    // Diagonal in different boxes: no repeat
    expect(repeatedCells([0, null, null, null, null, null, null, null, null, null, 0, null, null, null, null, null], 4).size).toBe(0);
  });

  it('counts only a full board without repeats as solved', () => {
    const full = fullBoard(4, seededRandom(3));
    expect(isSolved(full, 4)).toBe(true);
    expect(isSolved([null, ...full.slice(1)], 4)).toBe(false);
  });
});
