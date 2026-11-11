/**
 * Rules of "Place the pieces": a picture cut into square pieces, put in the wrong places. The player swaps
 * two pieces at a time (dragging one onto another, or tapping both) until every piece is back in place.
 * Modes and board sizes are shared with the other picture game (picture-game.ts).
 * Pure functions only, so the page stays a thin view and the rules are easy to test.
 */

import { cellCount, Shape } from './board';
import { Random } from './random';

/** The piece shown in each cell; piece `n` belongs in cell `n` */
export type Arrangement = readonly number[];

export function solvedArrangement(shape: Shape): Arrangement {
  return Array.from({ length: cellCount(shape) }, (_, cell) => cell);
}

export const isPlaced = (arrangement: Arrangement, cell: number): boolean => arrangement[cell] === cell;

export const isSolved = (arrangement: Arrangement): boolean => arrangement.every((piece, cell) => piece === cell);

/** How many pieces are in place, to show progress */
export const piecesPlaced = (arrangement: Arrangement): number =>
  arrangement.filter((piece, cell) => piece === cell).length;

export function swap(arrangement: Arrangement, first: number, second: number): Arrangement {
  return arrangement.map((piece, cell) =>
    cell === first ? arrangement[second] : cell === second ? arrangement[first] : piece,
  );
}

/** Pieces in random places, never already finished */
export function shuffle(shape: Shape, random: Random = Math.random): Arrangement {
  const pieces = [...solvedArrangement(shape)];
  do {
    // Fisher–Yates
    for (let index = pieces.length - 1; index > 0; index--) {
      const other = Math.floor(random() * (index + 1));
      [pieces[index], pieces[other]] = [pieces[other], pieces[index]];
    }
  } while (isSolved(pieces));
  return pieces;
}
