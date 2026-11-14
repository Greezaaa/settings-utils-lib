import { BoardLevel, BoardLevelId, cellCount, getBoardLevel, Shape } from './board';
import { between, pick, Random } from './random';

export type Direction = 'up' | 'right' | 'down' | 'left';

export const PUZZLE_LEVELS: readonly BoardLevel[] = [
  { id: 'easy', rows: 2, columns: 3 },
  { id: 'normal', rows: 3, columns: 3 },
  { id: 'hard', rows: 4, columns: 4 },
  { id: 'expert', rows: 5, columns: 5 },
];

export type Board = readonly (number | null)[];

export type Picture = readonly (readonly Direction[])[];

export interface Puzzle {
  readonly shape: Shape;
  readonly gap: number;
  readonly picture: Picture;
  readonly board: Board;
}

const SHUFFLE_MOVES_PER_CELL = 20;

const OFFSETS: Readonly<Record<Direction, { readonly row: number; readonly column: number }>> = {
  up: { row: -1, column: 0 },
  right: { row: 0, column: 1 },
  down: { row: 1, column: 0 },
  left: { row: 0, column: -1 },
};

const OPPOSITE: Readonly<Record<Direction, Direction>> = { up: 'down', right: 'left', down: 'up', left: 'right' };

const DIRECTIONS: readonly Direction[] = ['up', 'right', 'down', 'left'];

const MAX_LINES_PER_TILE = 3;

export const getPuzzleLevel = (id: BoardLevelId): BoardLevel => getBoardLevel(PUZZLE_LEVELS, id);

export function neighbour(shape: Shape, cell: number, direction: Direction): number | null {
  const row = Math.floor(cell / shape.columns) + OFFSETS[direction].row;
  const column = (cell % shape.columns) + OFFSETS[direction].column;
  return row >= 0 && row < shape.rows && column >= 0 && column < shape.columns ? row * shape.columns + column : null;
}

function neighbours(shape: Shape, cell: number): { readonly direction: Direction; readonly cell: number }[] {
  return DIRECTIONS.flatMap((direction) => {
    const next = neighbour(shape, cell, direction);
    return next === null ? [] : [{ direction, cell: next }];
  });
}

export function createPicture(shape: Shape, gap: number, random: Random = Math.random): Picture {
  for (;;) {
    const picture = drawLine(shape, gap, random);
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

export function solvedBoard(shape: Shape, gap: number): Board {
  return Array.from({ length: cellCount(shape) }, (_, cell) => (cell === gap ? null : cell));
}

export function isSolved(board: Board, gap: number): boolean {
  return board.every((tile, cell) => (cell === gap ? tile === null : tile === cell));
}

export const tilesInPlace = (board: Board): number => board.filter((tile, cell) => tile === cell).length;

export function canMove(shape: Shape, board: Board, cell: number): boolean {
  return board[cell] !== null && neighbours(shape, cell).some((next) => board[next.cell] === null);
}

export function move(shape: Shape, board: Board, cell: number): Board {
  if (!canMove(shape, board, cell)) {
    return board;
  }
  const gap = board.indexOf(null);
  return board.map((tile, index) => (index === gap ? board[cell] : index === cell ? null : tile));
}

export function cellForArrow(shape: Shape, board: Board, direction: Direction): number | null {
  return neighbour(shape, board.indexOf(null), OPPOSITE[direction]);
}

export function tileNumber(tile: number, gap: number): number {
  return tile < gap ? tile + 1 : tile;
}

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

const RANDOM_GAP_LEVELS: ReadonlySet<BoardLevelId> = new Set(['hard', 'expert']);

export function gapFor(level: BoardLevel, random: Random = Math.random): number {
  const last = cellCount(level) - 1;
  return RANDOM_GAP_LEVELS.has(level.id) ? between({ min: 0, max: last }, random) : last;
}

export function createPuzzle(level: BoardLevel, random: Random = Math.random): Puzzle {
  const gap = gapFor(level, random);
  const shape: Shape = { rows: level.rows, columns: level.columns };
  return {
    shape,
    gap,
    picture: createPicture(shape, gap, random),
    board: shuffle(shape, solvedBoard(shape, gap), gap, random),
  };
}
