import { describe, expect, it } from 'vitest';
import { PICTURE_LEVELS } from './picture-game';
import { isPlaced, isSolved, piecesPlaced, shuffle, solvedArrangement, swap } from './place-pieces';

describe('place the pieces rules', () => {
  it('starts finished with every piece in its own cell', () => {
    const arrangement = solvedArrangement({ rows: 2, columns: 2 });
    expect(arrangement).toEqual([0, 1, 2, 3]);
    expect(isSolved(arrangement)).toBe(true);
  });

  it('swaps two pieces', () => {
    expect(swap([0, 1, 2, 3], 0, 3)).toEqual([3, 1, 2, 0]);
    expect(swap([0, 1, 2, 3], 2, 2)).toEqual([0, 1, 2, 3]);
  });

  it('counts the pieces in place', () => {
    const arrangement = [0, 2, 1, 3];
    expect(piecesPlaced(arrangement)).toBe(2);
    expect(isPlaced(arrangement, 0)).toBe(true);
    expect(isPlaced(arrangement, 1)).toBe(false);
  });

  it.each(PICTURE_LEVELS.map((level) => [level.id, level] as const))(
    'shuffles %s boards into unfinished ones that keep every piece',
    (_, shape) => {
      for (let run = 0; run < 200; run++) {
        const arrangement = shuffle(shape);
        expect(isSolved(arrangement)).toBe(false);
        expect([...arrangement].sort((a, b) => a - b)).toEqual(solvedArrangement(shape));
      }
    },
  );
});
