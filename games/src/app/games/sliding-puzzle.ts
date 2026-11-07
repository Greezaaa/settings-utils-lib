/**
 * Rules of the "Sliding puzzle": a board of tiles with one gap. The finished picture is a line that joins
 * every tile; each tile shows its piece of the line, and the player slides tiles into the gap until the
 * pieces join up again. The gap sits in a different cell every game.
 * Pure functions only, so the page stays a thin view and the rules are easy to test.
 */

import { BoardLevel, BoardLevelId, cellCount, getBoardLevel, Shape } from './board';
import { between, pick, Random } from './random';

export type Direction = 'up' | 'right' | 'down' | 'left';

export const PUZZLE_LEVELS: readonly BoardLevel[] = [
  { id: 'easy', rows: 2, columns: 3 },
  { id: 'normal', rows: 3, columns: 3 },
  { id: 'hard', rows: 4, columns: 4 },
  { id: 'expert', rows: 5, columns: 5 },
];

/**
 * Board cells read left to right, top to bottom. A tile is named by the cell it belongs to in the finished
 * picture; `null` is the gap.
 */
export type Board = readonly (number | null)[];

/** The lines on each cell of the finished picture, by the edges they run to; the gap has none */
export type Picture = readonly (readonly Direction[])[];

export interface Puzzle {
  readonly shape: Shape;
  /** Cell left empty in the finished picture */
  readonly gap: number;
  readonly picture: Picture;
  /** Tiles as the player sees them now */
  readonly board: Board;
}

/** Random slides per cell when mixing up a new puzzle; each one is a real move, so every puzzle can be solved */
const SHUFFLE_MOVES_PER_CELL = 20;

const OFFSETS: Readonly<Record<Direction, { readonly row: number; readonly column: number }>> = {
  up: { row: -1, column: 0 },
  right: { row: 0, column: 1 },
  down: { row: 1, column: 0 },
  left: { row: 0, column: -1 },
};

const OPPOSITE: Readonly<Record<Direction, Direction>> = { up: 'down', right: 'left', down: 'up', left: 'right' };

const DIRECTIONS: readonly Direction[] = ['up', 'right', 'down', 'left'];

/**
 * Most lines a tile may have. A tile with all four can be a "+" whose arms bend into the corners, which can
 * look like a swastika: that must never appear on a kids' site, and without four-way crossings it can't.
 */
const MAX_LINES_PER_TILE = 3;

export const getPuzzleLevel = (id: BoardLevelId): BoardLevel => getBoardLevel(PUZZLE_LEVELS, id);

/** The cell next to `cell` in that direction, or `null` past the board's edge */
export function neighbour(shape: Shape, cell: number, direction: Direction): number | null {
  const row = Math.floor(cell / shape.columns) + OFFSETS[direction].row;
  const column = (cell % shape.columns) + OFFSETS[direction].column;
  return row >= 0 && row < shape.rows && column >= 0 && column < shape.columns ? row * shape.columns + column : null;
}

/** Every cell next to `cell`, with the direction it lies in */
function neighbours(shape: Shape, cell: number): { readonly direction: Direction; readonly cell: number }[] {
  return DIRECTIONS.flatMap((direction) => {
    const next = neighbour(shape, cell, direction);
    return next === null ? [] : [{ direction, cell: next }];
  });
}

/**
 * A random line through every cell around the gap: a random tree built by walking from cell to cell, so it
 * winds like a path and joins every tile, with at most three lines per tile.
 */
export function createPicture(shape: Shape, gap: number, random: Random = Math.random): Picture {
  for (;;) {
    const picture = drawLine(shape, gap, random);
    // Refusing a fourth line can, rarely, cut a tile off; then draw again
    if (picture.every((lines, cell) => cell === gap || lines.length > 0)) {
      return picture;
    }
  }
}

function drawLine(shape: Shape, gap: number, random: Random): Picture {
  const cells = cellCount(shape);
  const lines: Direction[][] = Array.from({ length: cells }, () => []);
  const start = pick(
    Array.from({ length: cells }, (_, cell) => cell).filter((cell) => cell !== gap),
    random,
  );
  const visited = new Set([gap, start]);
  const trail = [start];

  while (trail.length > 0) {
    const current = trail[trail.length - 1];
    const options =
      lines[current].length < MAX_LINES_PER_TILE
        ? neighbours(shape, current).filter(({ cell }) => !visited.has(cell))
        : [];
    if (options.length === 0) {
      trail.pop();
      continue;
    }
    const { direction, cell } = pick(options, random);
    lines[current].push(direction);
    lines[cell].push(OPPOSITE[direction]);
    visited.add(cell);
    trail.push(cell);
  }
  return lines;
}

/** The finished board: every tile in its own cell, and the gap */
export function solvedBoard(shape: Shape, gap: number): Board {
  return Array.from({ length: cellCount(shape) }, (_, cell) => (cell === gap ? null : cell));
}

export function isSolved(board: Board, gap: number): boolean {
  return board.every((tile, cell) => (cell === gap ? tile === null : tile === cell));
}

/** Whether the tile in `cell` can slide, i.e. it sits next to the gap */
export function canMove(shape: Shape, board: Board, cell: number): boolean {
  return board[cell] !== null && neighbours(shape, cell).some((next) => board[next.cell] === null);
}

/** The board after sliding the tile in `cell` into the gap; unchanged when that tile can't move */
export function move(shape: Shape, board: Board, cell: number): Board {
  if (!canMove(shape, board, cell)) {
    return board;
  }
  const gap = board.indexOf(null);
  return board.map((tile, index) => (index === gap ? board[cell] : index === cell ? null : tile));
}

/**
 * The cell of the tile an arrow key slides: ↑ moves the tile below the gap up into it, and so on.
 * `null` when there is no such tile.
 */
export function cellForArrow(shape: Shape, board: Board, direction: Direction): number | null {
  return neighbour(shape, board.indexOf(null), OPPOSITE[direction]);
}

/** Number shown on a tile, from 1 in reading order of the finished picture (the gap gets none) */
export function tileNumber(tile: number, gap: number): number {
  return tile < gap ? tile + 1 : tile;
}

/** Mixes up a board with random slides, never undoing the previous one, until it isn't finished */
export function shuffle(
  shape: Shape,
  board: Board,
  gap: number,
  random: Random = Math.random,
  moves = cellCount(shape) * SHUFFLE_MOVES_PER_CELL,
): Board {
  let current = board;
  do {
    let previous: number | null = null;
    for (let step = 0; step < moves; step++) {
      const empty = current.indexOf(null);
      const options = neighbours(shape, empty).filter(({ cell }) => cell !== previous);
      const { cell } = pick(options, random);
      previous = empty;
      current = move(shape, current, cell);
    }
  } while (isSolved(current, gap));
  return current;
}

/** A new puzzle of that size, with its gap in a random cell */
export function createPuzzle(shape: Shape, random: Random = Math.random): Puzzle {
  const gap = between({ min: 0, max: cellCount(shape) - 1 }, random);
  return {
    shape,
    gap,
    picture: createPicture(shape, gap, random),
    board: shuffle(shape, solvedBoard(shape, gap), gap, random),
  };
}
