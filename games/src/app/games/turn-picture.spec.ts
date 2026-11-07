import { describe, expect, it } from 'vitest';
import { getPictureLevel, PICTURE_LEVELS } from './picture-game';
import { fewestTaps, isRight, isSolved, scramble, tilesRight, turn } from './turn-picture';

describe('turn the picture rules', () => {
  it('has square boards from 2 × 2 to 5 × 5', () => {
    expect(PICTURE_LEVELS.map(({ rows, columns }) => `${rows}x${columns}`)).toEqual(['2x2', '3x3', '4x4', '5x5']);
    expect(getPictureLevel('expert')).toMatchObject({ rows: 5, columns: 5 });
  });

  it.each(PICTURE_LEVELS.map((level) => [level.id, level] as const))(
    'turns every %s tile away from its place',
    (_, shape) => {
      for (let run = 0; run < 200; run++) {
        const turns = scramble(shape);
        expect(turns).toHaveLength(shape.rows * shape.columns);
        expect(turns.every((count) => count >= 1 && count <= 3)).toBe(true);
        expect(isSolved(turns)).toBe(false);
      }
    },
  );

  it('turns one tile a quarter at a time, always the same way', () => {
    expect(turn([1, 2, 3, 3], 3)).toEqual([1, 2, 3, 4]);
    expect(turn([4], 0)).toEqual([5]);
  });

  it('counts a tile as right after any number of full turns', () => {
    expect([0, 4, 8].every(isRight)).toBe(true);
    expect([1, 2, 3, 5].some(isRight)).toBe(false);
    expect(isSolved([4, 8, 0, 12])).toBe(true);
  });

  it('counts the tiles that are right', () => {
    expect(tilesRight([0, 1, 4, 6, 8])).toBe(3);
  });

  it('knows the fewest taps that finish the picture', () => {
    expect(fewestTaps([1, 2, 3, 4])).toBe(3 + 2 + 1 + 0);
  });
});
