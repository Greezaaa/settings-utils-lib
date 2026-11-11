import { describe, expect, it } from 'vitest';
import { betterPerKey } from './results.service.js';

describe('betterPerKey', () => {
  it('keeps one result per game and settings, the better one', () => {
    expect(
      betterPerKey([
        { game: 'math-games', key: 'a', value: 5 },
        { game: 'math-games', key: 'a', value: 9 },
        { game: 'find-pairs', key: 'a', value: 30 },
        { game: 'find-pairs', key: 'a', value: 20 },
        { game: 'find-pairs', key: 'b', value: 40 },
      ]),
    ).toEqual([
      { game: 'math-games', key: 'a', value: 9 },
      { game: 'find-pairs', key: 'a', value: 20 },
      { game: 'find-pairs', key: 'b', value: 40 },
    ]);
  });
});
