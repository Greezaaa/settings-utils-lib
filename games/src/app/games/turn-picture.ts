import { cellCount, Shape } from './board';
import { between, Random } from './random';

export const FULL_TURN = 4;

export type Turns = readonly number[];

export function scramble(shape: Shape, random: Random = Math.random): Turns {
  return Array.from({ length: cellCount(shape) }, () => between({ min: 1, max: FULL_TURN - 1 }, random));
}

export function turn(turns: Turns, cell: number): Turns {
  return turns.map((count, index) => (index === cell ? count + 1 : count));
}

export const isRight = (count: number): boolean => count % FULL_TURN === 0;

export const isSolved = (turns: Turns): boolean => turns.every(isRight);

export const tilesRight = (turns: Turns): number => turns.filter(isRight).length;

export function fewestTaps(turns: Turns): number {
  return turns.reduce((taps, count) => taps + ((FULL_TURN - (count % FULL_TURN)) % FULL_TURN), 0);
}
