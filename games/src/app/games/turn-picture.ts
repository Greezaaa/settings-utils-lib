/**
 * Rules of "Turn the picture": a picture cut into square tiles, each turned away from its place. Every tap
 * turns a tile a quarter clockwise, always the same way, until the whole picture is right again.
 * Pure functions only, so the page stays a thin view and the rules are easy to test.
 */

import { BoardLevel, BoardLevelId, cellCount, getBoardLevel, Shape } from './board';
import { between, Random } from './random';

/** Look: the picture stays visible to compare. Memory: it shows only until the player is ready. */
export type TurnModeId = 'look' | 'memory';

export const TURN_MODE_IDS: readonly TurnModeId[] = ['look', 'memory'];

export const TURN_LEVELS: readonly BoardLevel[] = [
  { id: 'easy', rows: 2, columns: 2 },
  { id: 'normal', rows: 3, columns: 3 },
  { id: 'hard', rows: 4, columns: 4 },
  { id: 'expert', rows: 5, columns: 5 },
];

/** Turns that bring a tile back to where it started */
export const FULL_TURN = 4;

/**
 * Quarter turns each tile has had, clockwise. A tile is right when its count is a multiple of four.
 * Counts keep growing instead of wrapping, so the turning animation always goes clockwise.
 */
export type Turns = readonly number[];

export const getTurnLevel = (id: BoardLevelId): BoardLevel => getBoardLevel(TURN_LEVELS, id);

/** Every tile turned one, two or three quarters, so each one needs at least a tap */
export function scramble(shape: Shape, random: Random = Math.random): Turns {
  return Array.from({ length: cellCount(shape) }, () => between({ min: 1, max: FULL_TURN - 1 }, random));
}

/** The turns after one more quarter turn of the tile in `cell` */
export function turn(turns: Turns, cell: number): Turns {
  return turns.map((count, index) => (index === cell ? count + 1 : count));
}

export const isRight = (count: number): boolean => count % FULL_TURN === 0;

export const isSolved = (turns: Turns): boolean => turns.every(isRight);

/** Fewest taps that finish the picture from these turns */
export function fewestTaps(turns: Turns): number {
  return turns.reduce((taps, count) => taps + ((FULL_TURN - (count % FULL_TURN)) % FULL_TURN), 0);
}
