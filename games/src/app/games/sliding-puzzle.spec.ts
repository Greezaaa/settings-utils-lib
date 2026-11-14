import { describe, expect, it } from 'vitest';
import { cellCount, Shape } from './board';
import { canMove, cellForArrow, createPicture, createPuzzle, Direction, gapFor, getPuzzleLevel, isSolved, move, neighbour, Picture, PUZZLE_LEVELS, shuffle, solvedBoard, tileNumber } from './sliding-puzzle';

const RUNS = 200;
const THREE: Shape = { rows: 3, columns: 3 };
const WIDE: Shape = { rows: 2, columns: 3 };

const OPPOSITE: Record<Direction, Direction> = { up: 'down', right: 'left', down: 'up', left: 'right' };

function reachable(shape: Shape, picture: Picture, start: number): Set<number> {
  const seen = new Set([start]);
  const queue = [start];
  while (queue.length > 0) {
    const cell = queue.shift() ?? start;
    for (const direction of picture[cell]) {
      const next = neighbour(shape, cell, direction);
      if (next !== null && !seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
    }
  }
  return seen;
}

describe('sliding puzzle rules', () => {
  it('has four levels, from 2 × 3 to 5 × 5', () => {
    expect(PUZZLE_LEVELS.map(({ rows, columns }) => `${rows}x${columns}`)).toEqual(['2x3', '3x3', '4x4', '5x5']);
    expect(getPuzzleLevel('hard')).toMatchObject({ rows: 4, columns: 4 });
  });

  it('finds neighbours and stops at the edges, on square and wide boards', () => {
    expect(neighbour(THREE, 4, 'up')).toBe(1);
    expect(neighbour(THREE, 0, 'up')).toBeNull();
    expect(neighbour(WIDE, 2, 'down')).toBe(5);
    expect(neighbour(WIDE, 2, 'right')).toBeNull();
    expect(neighbour(WIDE, 4, 'down')).toBeNull();
  });

  it.each(PUZZLE_LEVELS.map((level) => [`${level.rows}×${level.columns}`, level] as const))(
    'draws one line that joins every tile on %s, and never a four-way cross',
    (_, shape) => {
      const cells = cellCount(shape);
      for (let run = 0; run < RUNS; run++) {
        const gap = run % cells;
        const picture = createPicture(shape, gap);
        const start = gap === 0 ? 1 : 0;

        expect(picture[gap]).toEqual([]);
        expect(reachable(shape, picture, start).size).toBe(cells - 1);
        expect(picture.flat().length).toBe((cells - 2) * 2);
        expect(picture.every((lines) => lines.length < 4)).toBe(true);
        picture.forEach((directions, cell) =>
          directions.forEach((direction) => {
            const next = neighbour(shape, cell, direction);
            expect(next === null ? [] : picture[next]).toContain(OPPOSITE[direction]);
          }),
        );
      }
    },
  );

  it('knows when the picture is finished', () => {
    expect(isSolved(solvedBoard(THREE, 4), 4)).toBe(true);
    expect(isSolved(move(THREE, solvedBoard(THREE, 4), 1), 4)).toBe(false);
  });

  it('only slides tiles next to the gap', () => {
    const board = solvedBoard(THREE, 4);
    expect(canMove(THREE, board, 1)).toBe(true);
    expect(canMove(THREE, board, 0)).toBe(false);
    expect(move(THREE, board, 0)).toBe(board);
    expect(move(THREE, board, 1)).toEqual([0, null, 2, 3, 1, 5, 6, 7, 8]);
  });

  it('maps arrow keys to the tile that slides into the gap', () => {
    const board = solvedBoard(THREE, 4);
    expect(cellForArrow(THREE, board, 'up')).toBe(7);
    expect(cellForArrow(THREE, board, 'left')).toBe(5);
    expect(cellForArrow(THREE, solvedBoard(THREE, 0), 'down')).toBeNull();
  });

  it('numbers tiles from 1, skipping the gap', () => {
    expect([0, 1, 2, 3, 5, 6, 7, 8].map((tile) => tileNumber(tile, 4))).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(tileNumber(1, 0)).toBe(1);
  });

  it.each(PUZZLE_LEVELS.map((level) => [level.id, level] as const))(
    'shuffles %s boards into unfinished ones',
    (_, shape) => {
      for (let run = 0; run < 50; run++) {
        const gap = run % cellCount(shape);
        const board = shuffle(shape, solvedBoard(shape, gap), gap);
        expect(isSolved(board, gap)).toBe(false);
        expect([...board].sort()).toEqual([...solvedBoard(shape, gap)].sort());
      }
    },
  );

  it('keeps the gap in the last cell on Easy and Normal', () => {
    for (const id of ['easy', 'normal'] as const) {
      const level = getPuzzleLevel(id);
      const gaps = new Set(Array.from({ length: RUNS }, () => createPuzzle(level).gap));
      expect([...gaps]).toEqual([cellCount(level) - 1]);
    }
  });

  it('puts the gap anywhere on Hard and Expert', () => {
    const hard = getPuzzleLevel('hard');
    const gaps = new Set(Array.from({ length: RUNS * 2 }, () => gapFor(hard)));
    expect(gaps.size).toBe(cellCount(hard));
  });
});
