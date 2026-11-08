import { describe, expect, it } from 'vitest';
import { readFavorites } from './favorite-games';

describe('readFavorites', () => {
  it('keeps known games once each, and nothing from anything else', () => {
    expect(readFavorites(['math-games', 'nope', 'math-games', 3, 'find-pairs'])).toEqual(['math-games', 'find-pairs']);
    expect(readFavorites('math-games')).toEqual([]);
    expect(readFavorites(null)).toEqual([]);
  });
});
