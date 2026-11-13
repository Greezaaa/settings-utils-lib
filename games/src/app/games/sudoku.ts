import { GameSlug } from '../core/games';
import { Random, shuffled } from './random';

/**
 * Sudoku: rules only, no Angular, so they can be tested on their own. A classic sudoku: each symbol (a letter or a
 * number, depending on the game) appears once in every row, every column and every box. Some symbols are given, and
 * the puzzle has only one answer; the player places the rest. Symbols are kept as indexes: 0 is the first.
 */

/** The games played on a sudoku board, which differ only in their symbols and texts */
export type SudokuGame = Extract<GameSlug, 'letter-sudoku' | 'number-sudoku'>;

/** Board sizes: as many symbols as rows */
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

/** A board in row order: each cell holds a symbol's index (0 for the first symbol), or null when empty */
export type SudokuBoard = readonly (number | null)[];

export interface SudokuPuzzle {
  readonly size: SudokuSize;
  /** The board as dealt; its symbols are given and can't be moved */
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
 * the same for columns, and the symbols shuffled
 */
export function fullBoard(size: SudokuSize, random: Random): number[] {
  const box = BOX_SHAPES[size];
  const rows = shuffledLines(size, box.rows, random);
  const columns = shuffledLines(size, box.columns, random);
  const symbols = shuffled(range(size), random);
  return range(size * size).map((cell) => {
    const [row, column] = [rows[Math.floor(cell / size)], columns[cell % size]];
    return symbols[(box.columns * (row % box.rows) + Math.floor(row / box.rows) + column) % size];
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
    const symbol = board[cell];
    board[cell] = null;
    if (countSolutions(board, size, 2) === 1) {
      emptied++;
    } else {
      board[cell] = symbol;
    }
  }
  return { size, start: board };
}

/** How many answers a board has, counting no further than `limit` */
export function countSolutions(board: SudokuBoard, size: SudokuSize, limit: number): number {
  // The symbols used in each row, column and box, one bit per symbol
  const [rows, columns, boxes] = [range(size).fill(0), range(size).fill(0), range(size).fill(0)];
  const units = (cell: number): [number, number, number] => [Math.floor(cell / size), cell % size, boxOf(cell, size)];
  const toggle = (cell: number, symbol: number): void => {
    const [row, column, box] = units(cell);
    rows[row] ^= 1 << symbol;
    columns[column] ^= 1 << symbol;
    boxes[box] ^= 1 << symbol;
  };
  const empty = new Set<number>();
  board.forEach((symbol, cell) => (symbol === null ? empty.add(cell) : toggle(cell, symbol)));

  const solve = (): number => {
    // The empty cell with the fewest symbols left to try, so wrong guesses end early
    let best: { cell: number; options: number[] } | null = null;
    for (const cell of empty) {
      const [row, column, box] = units(cell);
      const used = rows[row] | columns[column] | boxes[box];
      const options = range(size).filter((symbol) => !(used & (1 << symbol)));
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
    for (const symbol of best.options) {
      toggle(best.cell, symbol);
      found += solve();
      toggle(best.cell, symbol);
      if (found >= limit) {
        break;
      }
    }
    empty.add(best.cell);
    return found;
  };
  return Math.min(solve(), limit);
}

/** Cells whose symbol appears again in their row, column or box */
export function repeatedCells(board: SudokuBoard, size: SudokuSize): ReadonlySet<number> {
  const repeated = new Set<number>();
  board.forEach((symbol, cell) => {
    if (symbol !== null && board.some((other, index) => other === symbol && sharesUnit(cell, index, size))) {
      repeated.add(cell);
    }
  });
  return repeated;
}

/** Every cell filled and no symbol repeated in a row, column or box */
export const isSolved = (board: SudokuBoard, size: SudokuSize): boolean =>
  board.every((symbol) => symbol !== null) && repeatedCells(board, size).size === 0;

/** 0 to count - 1 */
const range = (count: number): number[] => Array.from({ length: count }, (_, index) => index);

/** Line numbers (rows or columns) in a random order that keeps each band of `band` lines together */
function shuffledLines(size: number, band: number, random: Random): number[] {
  return shuffled(range(size / band), random).flatMap((group) =>
    shuffled(range(band), random).map((line) => group * band + line),
  );
}
