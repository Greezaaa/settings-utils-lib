import { cellCount, Shape } from './board';
import { Random } from './random';

export type Arrangement = readonly number[];

export function solvedArrangement(shape: Shape): Arrangement {
  return Array.from({ length: cellCount(shape) }, (_, cell) => cell);
}

export const isPlaced = (arrangement: Arrangement, cell: number): boolean => arrangement[cell] === cell;

export const isSolved = (arrangement: Arrangement): boolean => arrangement.every((piece, cell) => piece === cell);

export const piecesPlaced = (arrangement: Arrangement): number =>
  arrangement.filter((piece, cell) => piece === cell).length;

export function swap(arrangement: Arrangement, first: number, second: number): Arrangement {
  return arrangement.map((piece, cell) =>
    cell === first ? arrangement[second] : cell === second ? arrangement[first] : piece,
  );
}

export function shuffle(shape: Shape, random: Random = Math.random): Arrangement {
  const pieces = [...solvedArrangement(shape)];
  do {
    for (let index = pieces.length - 1; index > 0; index--) {
      const other = Math.floor(random() * (index + 1));
      [pieces[index], pieces[other]] = [pieces[other], pieces[index]];
    }
  } while (isSolved(pieces));
  return pieces;
}
