import { Random, shuffled } from './random';

/**
 * Letter sudoku: rules only, no Angular, so they can be tested on their own. A classic sudoku with letters: each
 * letter appears once in every row, every column and every box. Some letters are given, and the puzzle has only one
 * answer; the player places the rest.
 */

/** Board sizes: as many letters as rows */
export const SUDOKU_SIZES = [4, 6, 9] as const;
export type SudokuSize = (typeof SUDOKU_SIZES)[number];

export const DEFAULT_SUDOKU_SIZE: SudokuSize = 4;

/** The boxes of a size, in cells */
export interface BoxShape {
  readonly rows: number;
  readonly columns: number;
}

export const BOX_SHAPES: Readonly<Record<SudokuSize, BoxShape>> = {
  4: { rows: 2, columns: 2 },
  6: { rows: 2, columns: 3 },
  9: { rows: 3, columns: 3 },
};

/** How many cells to empty on each size, as long as the puzzle keeps only one answer */
const EMPTY_CELLS: Readonly<Record<SudokuSize, number>> = { 4: 9, 6: 20, 9: 46 };

/** A board in row order: each cell holds a letter's index (0 for the first letter), or null when empty */
export type SudokuBoard = readonly (number | null)[];

export interface SudokuPuzzle {
  readonly size: SudokuSize;
  /** The board as dealt; its letters are given and can't be moved */
  readonly start: SudokuBoard;
}

/** The box a cell is in, counted in row order */
export function boxOf(cell: number, size: SudokuSize): number {
  const box = BOX_SHAPES[size];
  const [row, column] = [Math.floor(cell / size), cell % size];
  return Math.floor(row / box.rows) * (size / box.columns) + Math.floor(column / box.columns);
}

/** Whether two different cells share a row, a column or a box */
const sharesUnit = (cell: number, other: number, size: SudokuSize): boolean =>
  cell !== other &&
  (Math.floor(cell / size) === Math.floor(other / size) ||
    cell % size === other % size ||
    boxOf(cell, size) === boxOf(other, size));

/** The cells of each box, boxes and cells in row order */
export function boxCells(size: SudokuSize): number[][] {
  const boxes: number[][] = Array.from({ length: size }, () => []);
  for (let cell = 0; cell < size * size; cell++) {
    boxes[boxOf(cell, size)].push(cell);
  }
  return boxes;
}

/**
 * A random full board: the classic pattern, then its rows shuffled within their band of boxes, the bands shuffled,
 * the same for columns, and the letters shuffled
 */
export function fullBoard(size: SudokuSize, random: Random): number[] {
  const box = BOX_SHAPES[size];
  const rows = shuffledLines(size, box.rows, random);
  const columns = shuffledLines(size, box.columns, random);
  const letters = shuffled(range(size), random);
  return range(size * size).map((cell) => {
    const [row, column] = [rows[Math.floor(cell / size)], columns[cell % size]];
    return letters[(box.columns * (row % box.rows) + Math.floor(row / box.rows) + column) % size];
  });
}

/** A new puzzle: a full board with cells emptied one by one, each only if the puzzle keeps a single answer */
export function dealSudoku(size: SudokuSize, random: Random): SudokuPuzzle {
  const board: (number | null)[] = fullBoard(size, random);
  let emptied = 0;
  for (const cell of shuffled(range(size * size), random)) {
    if (emptied === EMPTY_CELLS[size]) {
      break;
    }
    const letter = board[cell];
    board[cell] = null;
    if (countSolutions(board, size, 2) === 1) {
      emptied++;
    } else {
      board[cell] = letter;
    }
  }
  return { size, start: board };
}

/** How many answers a board has, counting no further than `limit` */
export function countSolutions(board: SudokuBoard, size: SudokuSize, limit: number): number {
  // The letters used in each row, column and box, one bit per letter
  const [rows, columns, boxes] = [range(size).fill(0), range(size).fill(0), range(size).fill(0)];
  const units = (cell: number): [number, number, number] => [Math.floor(cell / size), cell % size, boxOf(cell, size)];
  const toggle = (cell: number, letter: number): void => {
    const [row, column, box] = units(cell);
    rows[row] ^= 1 << letter;
    columns[column] ^= 1 << letter;
    boxes[box] ^= 1 << letter;
  };
  const empty = new Set<number>();
  board.forEach((letter, cell) => (letter === null ? empty.add(cell) : toggle(cell, letter)));

  const solve = (): number => {
    // The empty cell with the fewest letters left to try, so wrong guesses end early
    let best: { cell: number; options: number[] } | null = null;
    for (const cell of empty) {
      const [row, column, box] = units(cell);
      const used = rows[row] | columns[column] | boxes[box];
      const options = range(size).filter((letter) => !(used & (1 << letter)));
      if (best === null || options.length < best.options.length) {
        best = { cell, options };
      }
      if (options.length === 0) {
        return 0;
      }
    }
    if (best === null) {
      return 1;
    }
    empty.delete(best.cell);
    let found = 0;
    for (const letter of best.options) {
      toggle(best.cell, letter);
      found += solve();
      toggle(best.cell, letter);
      if (found >= limit) {
        break;
      }
    }
    empty.add(best.cell);
    return found;
  };
  return Math.min(solve(), limit);
}

/** Cells whose letter appears again in their row, column or box */
export function repeatedCells(board: SudokuBoard, size: SudokuSize): ReadonlySet<number> {
  const repeated = new Set<number>();
  board.forEach((letter, cell) => {
    if (letter !== null && board.some((other, index) => other === letter && sharesUnit(cell, index, size))) {
      repeated.add(cell);
    }
  });
  return repeated;
}

/** Every cell filled and no letter repeated in a row, column or box */
export const isSolved = (board: SudokuBoard, size: SudokuSize): boolean =>
  board.every((letter) => letter !== null) && repeatedCells(board, size).size === 0;

/** 0 to count - 1 */
const range = (count: number): number[] => Array.from({ length: count }, (_, index) => index);

/** Line numbers (rows or columns) in a random order that keeps each band of `band` lines together */
function shuffledLines(size: number, band: number, random: Random): number[] {
  return shuffled(range(size / band), random).flatMap((group) =>
    shuffled(range(band), random).map((line) => group * band + line),
  );
}
