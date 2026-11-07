import { describe, expect, it } from 'vitest';
import { byCategory, GAME_SLUGS, GAMES, gameInfo } from './games';

describe('games', () => {
  it('lists every game once, in a category', () => {
    expect(new Set(GAME_SLUGS).size).toBe(GAMES.length);
    expect(
      byCategory(GAME_SLUGS)
        .flatMap(({ games }) => games)
        .sort(),
    ).toEqual([...GAME_SLUGS].sort());
    expect(byCategory(['hit-the-note'])).toEqual([{ category: 'music', games: ['hit-the-note'] }]);
  });

  it('finds a game’s details', () => {
    expect(gameInfo('math-games').category).toBe('numbers');
  });
});
