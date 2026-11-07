import { describe, expect, it } from 'vitest';
import { GAME_SLUGS, GAMES, GAMES_BY_CATEGORY, gameInfo } from './games';

describe('games', () => {
  it('lists every game once, in a category', () => {
    expect(new Set(GAME_SLUGS).size).toBe(GAMES.length);
    expect(GAMES_BY_CATEGORY.flatMap(({ games }) => games).sort()).toEqual([...GAME_SLUGS].sort());
  });

  it('finds a game’s details', () => {
    expect(gameInfo('math-games').category).toBe('numbers');
  });
});
