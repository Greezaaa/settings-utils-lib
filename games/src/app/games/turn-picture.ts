/**
 * Rules of "Turn the picture": a picture cut into square tiles, each turned away from its place. Every tap
 * turns a tile a quarter clockwise, always the same way, until the whole picture is right again.
 * Modes and board sizes are shared with the other picture game (picture-game.ts).
 * Pure functions only, so the page stays a thin view and the rules are easy to test.
 */

import { cellCount, Shape } from './board';
import { between, Random } from './random';

/** Turns that bring a tile back to where it started */
export const FULL_TURN = 4;

/**
 * Quarter turns each tile has had, clockwise. A tile is right when its count is a multiple of four.
 * Counts keep growing instead of wrapping, so the turning animation always goes clockwise.
 */
export type Turns = readonly number[];

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

/** How many tiles are right, to show progress */
export const tilesRight = (turns: Turns): number => turns.filter(isRight).length;

/** Fewest taps that finish the picture from these turns */
export function fewestTaps(turns: Turns): number {
  return turns.reduce((taps, count) => taps + ((FULL_TURN - (count % FULL_TURN)) % FULL_TURN), 0);
}
