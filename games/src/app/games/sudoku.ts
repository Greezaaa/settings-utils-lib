import { GameSlug } from '../core/games';
import { Random, shuffled } from './random';

export type SudokuGame = Extract<GameSlug, 'letter-sudoku' | 'number-sudoku'>;

export const SUDOKU_SIZES = [4, 6, 9] as const;
export type SudokuSize = (typeof SUDOKU_SIZES)[number];

export const DEFAULT_SUDOKU_SIZE: SudokuSize = 4;

export interface BoxShape {
  readonly rows: number;
  readonly columns: number;
}

export const BOX_SHAPES: Readonly<Record<SudokuSize, BoxShape>> = {
  4: { rows: 2, columns: 2 },
  6: { rows: 2, columns: 3 },
  9: { rows: 3, columns: 3 },
};

const EMPTY_CELLS: Readonly<Record<SudokuSize, number>> = { 4: 9, 6: 20, 9: 46 };

export type SudokuBoard = readonly (number | null)[];

export interface SudokuPuzzle {
  readonly size: SudokuSize;
  readonly start: SudokuBoard;
}

export function boxOf(cell: number, size: SudokuSize): number {
  const box = BOX_SHAPES[size];
  const [row, column] = [Math.floor(cell / size), cell % size];
  return Math.floor(row / box.rows) * (size / box.columns) + Math.floor(column / box.columns);
}

const sharesUnit = (cell: number, other: number, size: SudokuSize): boolean =>
  cell !== other &&
  (Math.floor(cell / size) === Math.floor(other / size) ||
    cell % size === other % size ||
    boxOf(cell, size) === boxOf(other, size));

export function boxCells(size: SudokuSize): number[][] {
  const boxes: number[][] = Array.from({ length: size }, () => []);
  for (let cell = 0; cell < size * size; cell++) {
    boxes[boxOf(cell, size)].push(cell);
  }
  return boxes;
}

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

export function countSolutions(board: SudokuBoard, size: SudokuSize, limit: number): number {
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

export function repeatedCells(board: SudokuBoard, size: SudokuSize): ReadonlySet<number> {
  const repeated = new Set<number>();
  board.forEach((symbol, cell) => {
    if (symbol !== null && board.some((other, index) => other === symbol && sharesUnit(cell, index, size))) {
      repeated.add(cell);
    }
  });
  return repeated;
}

export const isSolved = (board: SudokuBoard, size: SudokuSize): boolean =>
  board.every((symbol) => symbol !== null) && repeatedCells(board, size).size === 0;

const range = (count: number): number[] => Array.from({ length: count }, (_, index) => index);

function shuffledLines(size: number, band: number, random: Random): number[] {
  return shuffled(range(size / band), random).flatMap((group) =>
    shuffled(range(band), random).map((line) => group * band + line),
  );
}
